import { Message } from "@anchan828/nest-cloud-run-queue-common";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { isBase64 } from "class-validator";
import { QueueWorkerDecodedMessage, QueueWorkerModuleOptions } from "./interfaces";
import {
  ALL_WORKERS_QUEUE_WORKER_NAME,
  QUEUE_WORKER_MODULE_OPTIONS,
  UNHANDLED_QUEUE_WORKER_NAME,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_QUEUE_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
} from "./constants";
import { QueueWorkerExplorerService } from "./explorer.service";
import {
  QueueWorkerRawMessage,
  QueueWorkerMetadata,
  QueueWorkerProcessor,
  QueueWorkerProcessorStatus,
} from "./interfaces";
import { parseJSON, sortByPriority } from "./util";

@Injectable()
export class QueueWorkerService {
  #_allWorkers: QueueWorkerMetadata[] | undefined;

  get #allWorkers(): QueueWorkerMetadata[] {
    if (!this.#_allWorkers) {
      this.#_allWorkers = this.explorerService.explore();
    }
    return this.#_allWorkers;
  }

  get #spetialWorkers(): QueueWorkerMetadata[] {
    return (this.#_allWorkers || []).filter((worker) =>
      [ALL_WORKERS_QUEUE_WORKER_NAME, UNHANDLED_QUEUE_WORKER_NAME].includes(worker.name),
    );
  }

  constructor(
    @Inject(QUEUE_WORKER_MODULE_OPTIONS)
    private readonly options: QueueWorkerModuleOptions,
    private readonly logger: Logger,
    private readonly explorerService: QueueWorkerExplorerService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async execute(rawMessage: QueueWorkerRawMessage | QueueWorkerDecodedMessage): Promise<void> {
    await this.runWorkers(this.isDecodedMessage(rawMessage) ? rawMessage : this.decodeMessage(rawMessage));
  }

  public decodeMessage<T = any>(message: QueueWorkerRawMessage): QueueWorkerDecodedMessage<T> {
    const data = this.decodeData<T>(message.data);

    if (!data.name) {
      throw new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND);
    }

    return {
      data,
      headers: message.headers,
      raw: message,
    };
  }

  private async runWorkers(decodedMessage: QueueWorkerDecodedMessage): Promise<void> {
    const maxRetryAttempts = this.options.maxRetryAttempts ?? 1;
    const workers: QueueWorkerMetadata[] = [];

    workers.push(...this.#allWorkers.filter((worker) => decodedMessage.data.name === worker.name));

    if (this.options?.throwModuleError && workers.length === 0 && this.#spetialWorkers.length === 0) {
      throw new BadRequestException(ERROR_WORKER_NOT_FOUND(decodedMessage.data.name));
    }

    const processors = sortByPriority(workers)
      .map((w) => sortByPriority(w.processors))
      .flat();

    const spetialProcessors = sortByPriority(this.#spetialWorkers)
      .map((w) => sortByPriority(w.processors))
      .flat();

    const processorStatus = await this.options.extraConfig?.preProcessor?.(
      decodedMessage.data.name,
      decodedMessage.data.data,
      decodedMessage.raw,
    );

    if (processorStatus !== QueueWorkerProcessorStatus.SKIP) {
      for (const processor of processors) {
        await this.execProcessor(processor.processor, maxRetryAttempts, decodedMessage.data.data, decodedMessage.raw);
      }

      for (const processor of spetialProcessors) {
        await this.execProcessor(processor.processor, maxRetryAttempts, decodedMessage.data, decodedMessage.raw);
      }
    }

    await this.options.extraConfig?.postProcessor?.(
      decodedMessage.data.name,
      decodedMessage.data.data,
      decodedMessage.raw,
    );
  }

  private isDecodedMessage(
    message: QueueWorkerRawMessage | QueueWorkerDecodedMessage,
  ): message is QueueWorkerDecodedMessage {
    return !!message.raw;
  }

  private decodeData<T = any>(data?: string | Uint8Array | Buffer | null): Message<T> {
    if (!data) {
      throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
    }

    if (Buffer.isBuffer(data)) {
      data = data.toString();
    }

    if (data instanceof Uint8Array) {
      data = new TextDecoder("utf8").decode(data);
    }

    if (isBase64(data)) {
      data = Buffer.from(data, "base64").toString();
    }
    try {
      if (typeof data === "string") {
        return parseJSON(data) as Message;
      }

      return data;
    } catch {
      throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }

  private async execProcessor<T>(
    processor: QueueWorkerProcessor,
    maxRetryAttempts: number,
    data: T,
    raw: QueueWorkerRawMessage,
  ): Promise<void> {
    for (let i = 0; i < maxRetryAttempts; i++) {
      try {
        await processor(data, raw);
        i = maxRetryAttempts;
      } catch (error: any) {
        this.logger.error(error.message);
      }
    }
  }
}

import { Message } from "@anchan828/nest-cloud-run-queue-common";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { isBase64 } from "class-validator";
import { QueueWorkerModuleOptions } from "./interfaces";
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
  #allWorkers: QueueWorkerMetadata[] | undefined;

  constructor(
    @Inject(QUEUE_WORKER_MODULE_OPTIONS)
    private readonly options: QueueWorkerModuleOptions,
    private readonly logger: Logger,
    private readonly explorerService: QueueWorkerExplorerService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async execute(message: QueueWorkerRawMessage): Promise<void> {
    if (!this.#allWorkers) {
      this.#allWorkers = this.explorerService.explore();
    }

    const maxRetryAttempts = this.options.maxRetryAttempts ?? 1;
    const workers: QueueWorkerMetadata[] = [];
    const spetialWorkers: QueueWorkerMetadata[] = [];
    let data: Message<any> = { name: "" };
    try {
      data = this.decodeData(message.data);
      if (!data.name) {
        throw new Error(ERROR_QUEUE_WORKER_NAME_NOT_FOUND);
      }

      workers.push(...this.#allWorkers.filter((worker) => data.name === worker.name));

      spetialWorkers.push(
        ...this.#allWorkers.filter((worker) =>
          [ALL_WORKERS_QUEUE_WORKER_NAME, UNHANDLED_QUEUE_WORKER_NAME].includes(worker.name),
        ),
      );

      if (workers.length === 0) {
        throw new Error(ERROR_WORKER_NOT_FOUND(data.name));
      }
    } catch (error: any) {
      this.logger.error(error.message);
      if (this.options?.throwModuleError && spetialWorkers.length === 0) {
        throw new BadRequestException(error.message);
      }
    }
    const processors = sortByPriority(workers)
      .map((w) => sortByPriority(w.processors))
      .flat();
    const spetialProcessors = sortByPriority(spetialWorkers)
      .map((w) => sortByPriority(w.processors))
      .flat();
    const processorStatus = await this.options.extraConfig?.preProcessor?.(data.name, data.data, message);
    if (processorStatus !== QueueWorkerProcessorStatus.SKIP) {
      for (const processor of processors) {
        await this.execProcessor(processor.processor, maxRetryAttempts, data.data, message);
      }

      for (const processor of spetialProcessors) {
        await this.execProcessor(processor.processor, maxRetryAttempts, data, message);
      }
    }

    await this.options.extraConfig?.postProcessor?.(data.name, data.data, message);
  }

  private async execProcessor<T>(
    processor: QueueWorkerProcessor,
    maxRetryAttempts: number,
    data: T,
    rawMessage: QueueWorkerRawMessage,
  ): Promise<void> {
    for (let i = 0; i < maxRetryAttempts; i++) {
      try {
        await processor(data, rawMessage);
        i = maxRetryAttempts;
      } catch (error: any) {
        this.logger.error(error.message);
      }
    }
  }

  private decodeData(data?: string | Uint8Array | Buffer | null): Message {
    if (!data) {
      throw new Error(ERROR_INVALID_MESSAGE_FORMAT);
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
      throw new Error(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }
}

import { CloudRunQueueMessage } from "@anchan828/nest-cloud-run-common";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { isBase64 } from "class-validator";
import { CloudRunWorkerModuleOptions } from "./interfaces";
import {
  CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
  CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS,
  CLOUD_RUN_UNHANDLED_WORKER_NAME,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
} from "./constants";
import { CloudRunWorkerExplorerService } from "./explorer.service";
import {
  CloudRunWorkerRawMessage,
  CloudRunWorkerMetadata,
  CloudRunWorkerProcessor,
  CloudRunWorkerProcessorStatus,
} from "./interfaces";
import { parseJSON, sortByPriority } from "./util";
@Injectable()
export class CloudRunWorkerService {
  #allWorkers: CloudRunWorkerMetadata[] | undefined;

  constructor(
    @Inject(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)
    private readonly options: CloudRunWorkerModuleOptions,
    private readonly logger: Logger,
    private readonly explorerService: CloudRunWorkerExplorerService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async execute(message: CloudRunWorkerRawMessage): Promise<void> {
    if (!this.#allWorkers) {
      this.#allWorkers = this.explorerService.explore();
    }

    const maxRetryAttempts = this.options.maxRetryAttempts ?? 1;
    const workers: CloudRunWorkerMetadata[] = [];
    const spetialWorkers: CloudRunWorkerMetadata[] = [];
    let data: CloudRunQueueMessage<any> = { name: "" };
    try {
      data = this.decodeData(message.data);
      if (!data.name) {
        throw new Error(ERROR_WORKER_NAME_NOT_FOUND);
      }

      workers.push(...this.#allWorkers.filter((worker) => data.name === worker.name));

      spetialWorkers.push(
        ...this.#allWorkers.filter((worker) =>
          [CLOUD_RUN_ALL_WORKERS_WORKER_NAME, CLOUD_RUN_UNHANDLED_WORKER_NAME].includes(worker.name),
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
    if (processorStatus !== CloudRunWorkerProcessorStatus.SKIP) {
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
    processor: CloudRunWorkerProcessor,
    maxRetryAttempts: number,
    data: T,
    rawMessage: CloudRunWorkerRawMessage,
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

  private decodeData(data?: string | Uint8Array | Buffer | null): CloudRunQueueMessage {
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
        return parseJSON(data) as CloudRunQueueMessage;
      }

      return data;
    } catch {
      throw new Error(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }
}

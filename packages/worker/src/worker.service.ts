import { CloudRunPubSubMessage } from "@anchan828/nest-cloud-run-pubsub-common";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { isBase64 } from "class-validator";
import { CloudRunPubSubWorkerModuleOptions } from ".";
import {
  CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
  CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS,
  CLOUD_RUN_UNHANDLED_WORKER_NAME,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
} from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import {
  CloudRunPubSubWorkerMetadata,
  CloudRunPubSubWorkerProcessor,
  CloudRunPubSubWorkerProcessorStatus,
} from "./interfaces";
import { CloudRunPubSubWorkerPubSubMessage } from "./message.dto";
import { parseJSON, sortByPriority } from "./util";
@Injectable()
export class CloudRunPubSubWorkerService {
  #allWorkers: CloudRunPubSubWorkerMetadata[] | undefined;

  constructor(
    @Inject(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)
    private readonly options: CloudRunPubSubWorkerModuleOptions,
    private readonly logger: Logger,
    private readonly explorerService: CloudRunPubSubWorkerExplorerService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async execute(message: CloudRunPubSubWorkerPubSubMessage): Promise<void> {
    if (!this.#allWorkers) {
      this.#allWorkers = this.explorerService.explore();
    }

    const maxRetryAttempts = this.options.maxRetryAttempts ?? 1;
    const workers: CloudRunPubSubWorkerMetadata[] = [];
    const spetialWorkers: CloudRunPubSubWorkerMetadata[] = [];
    let data: CloudRunPubSubMessage<any> = { name: "" };
    const attributes = message.attributes || {};
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
    } catch (error) {
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
    const processorStatus = await this.options.extraConfig?.preProcessor?.(data.name, data.data, attributes, message);
    if (processorStatus !== CloudRunPubSubWorkerProcessorStatus.SKIP) {
      for (const processor of processors) {
        await this.execProcessor(processor.processor, maxRetryAttempts, data.data, attributes, message);
      }

      for (const processor of spetialProcessors) {
        await this.execProcessor(processor.processor, maxRetryAttempts, data, attributes, message);
      }
    }

    await this.options.extraConfig?.postProcessor?.(data.name, data.data, attributes, message);
  }

  private async execProcessor<T>(
    processor: CloudRunPubSubWorkerProcessor,
    maxRetryAttempts: number,
    data: T,
    attributes: Record<string, any>,
    rawMessage: CloudRunPubSubWorkerPubSubMessage,
  ): Promise<void> {
    for (let i = 0; i < maxRetryAttempts; i++) {
      try {
        await processor(data, attributes, rawMessage);
        i = maxRetryAttempts;
      } catch (error) {
        this.logger.error(error.message);
      }
    }
  }

  private decodeData(data?: string | Uint8Array | Buffer | null): CloudRunPubSubMessage {
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
      return parseJSON(data) as CloudRunPubSubMessage;
    } catch {
      throw new Error(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }
}

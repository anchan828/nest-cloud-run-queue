import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";

import { Message } from "@anchan828/nest-cloud-run-queue-common";
import {
  ALL_WORKERS_QUEUE_WORKER_NAME,
  ERROR_WORKER_NOT_FOUND,
  QUEUE_WORKER_MODULE_OPTIONS,
  UNHANDLED_QUEUE_WORKER_NAME,
} from "./constants";
import { QueueWorkerExplorerService } from "./explorer.service";
import {
  QueueWorkerDecodedMessage,
  QueueWorkerMetadata,
  QueueWorkerModuleOptions,
  QueueWorkerProcessorMetadata,
  QueueWorkerProcessorStatus,
  QueueWorkerProcessResult,
  QueueWorkerRawMessage,
} from "./interfaces";
import { decodeMessage, sortByPriority } from "./util";

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

  public async execute<T = any>(meessage: Message<T>): Promise<QueueWorkerProcessResult<T>[]>;

  public async execute<T = any>(meessage: QueueWorkerDecodedMessage<T>): Promise<QueueWorkerProcessResult<T>[]>;

  public async execute<T = any>(meessage: QueueWorkerRawMessage<T>): Promise<QueueWorkerProcessResult<T>[]>;

  public async execute<T = any>(
    meessage: QueueWorkerRawMessage<T> | QueueWorkerDecodedMessage<T> | Message<T>,
  ): Promise<QueueWorkerProcessResult<T>[]> {
    return await this.runWorkers(this.isDecodedMessage(meessage) ? meessage : decodeMessage(meessage));
  }

  /**
   * @deprecated Use `decodeMessage` function instead.
   */
  public decodeMessage<T = any>(message: QueueWorkerRawMessage | Message): QueueWorkerDecodedMessage<T> {
    return decodeMessage(message);
  }

  private async runWorkers<T = any>(
    decodedMessage: QueueWorkerDecodedMessage<T>,
  ): Promise<QueueWorkerProcessResult<T>[]> {
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
    const QueueWorkerProcessResults: QueueWorkerProcessResult<T>[] = [];
    const processorStatus = await this.options.extraConfig?.preProcessor?.(
      decodedMessage.data.name,
      decodedMessage.data.data,
      decodedMessage.raw,
    );

    if (processorStatus !== QueueWorkerProcessorStatus.SKIP) {
      for (const processor of processors) {
        QueueWorkerProcessResults.push(
          await this.executeProcessor(processor, maxRetryAttempts, decodedMessage.data.data, decodedMessage.raw),
        );
      }

      for (const processor of spetialProcessors) {
        await this.executeProcessor(processor, maxRetryAttempts, decodedMessage.data, decodedMessage.raw);
      }
    }

    await this.options.extraConfig?.postProcessor?.(
      decodedMessage.data.name,
      decodedMessage.data.data,
      decodedMessage.raw,
    );

    return QueueWorkerProcessResults;
  }

  private isDecodedMessage<T = any>(
    message: QueueWorkerRawMessage<T> | QueueWorkerDecodedMessage<T> | Message<T>,
  ): message is QueueWorkerDecodedMessage<T> {
    return "raw" in message;
  }

  private async executeProcessor<T = any>(
    processorMetadata: QueueWorkerProcessorMetadata,
    maxRetryAttempts: number,
    data: T | undefined,
    raw: QueueWorkerRawMessage,
  ): Promise<QueueWorkerProcessResult<T>> {
    for (let i = 0; i < maxRetryAttempts; i++) {
      try {
        await processorMetadata.processor(data, raw);
        i = maxRetryAttempts;
      } catch (error: any) {
        this.logger.error(error.message);
        if (maxRetryAttempts === i + 1) {
          return {
            data,
            error,
            processorName: processorMetadata.processorName,
            raw,
            success: false,
            workerName: processorMetadata.workerName,
          };
        }
      }
    }

    return {
      data,
      processorName: processorMetadata.processorName,
      raw,
      success: true,
      workerName: processorMetadata.workerName,
    };
  }
}

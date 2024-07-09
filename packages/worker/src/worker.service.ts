import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { Message } from "@anchan828/nest-cloud-run-queue-common";
import { ERROR_QUEUE_WORKER_NAME_NOT_FOUND, ERROR_WORKER_NOT_FOUND, QUEUE_WORKER_MODULE_OPTIONS } from "./constants";
import { QueueWorkerExplorerService } from "./explorer.service";
import {
  QueueWorkerDecodedMessage,
  QueueWorkerMetadata,
  QueueWorkerModuleOptions,
  QueueWorkerProcessResult,
  QueueWorkerRawMessage,
} from "./interfaces";
import { decodeMessage } from "./util";
import { Worker } from "./worker";

@Injectable()
export class QueueWorkerService {
  #_allWorkers: QueueWorkerMetadata[] | undefined;

  get #allWorkers(): QueueWorkerMetadata[] {
    if (!this.#_allWorkers) {
      this.#_allWorkers = this.explorerService.explore();
    }
    return this.#_allWorkers;
  }

  constructor(
    @Inject(QUEUE_WORKER_MODULE_OPTIONS)
    private readonly options: QueueWorkerModuleOptions,
    private readonly explorerService: QueueWorkerExplorerService,
  ) {}

  /**
   * Execute all workers that match the worker name. If you want to execute a each worker, use `getWorkers` method.
   */
  public async execute<T = any>(
    meessage: QueueWorkerRawMessage<T> | QueueWorkerDecodedMessage<T> | Message<T>,
  ): Promise<QueueWorkerProcessResult<T>[]> {
    const decodedMessage = this.isDecodedMessage(meessage) ? meessage : decodeMessage(meessage);

    if (this.options.throwModuleError && !decodedMessage.data.name) {
      throw new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND);
    }

    const workers = await this.getWorkers(decodedMessage);

    if (this.options.throwModuleError && workers.length === 0) {
      throw new BadRequestException(ERROR_WORKER_NOT_FOUND(decodedMessage.data.name));
    }

    const results: QueueWorkerProcessResult<T>[] = [];

    for (const worker of workers) {
      results.push(...(await worker.execute()));
    }

    return results;
  }

  /**
   * Get all workers that match the worker name. Use this method to execute manually when you want to execute only on specific conditions using metadata such as class name or processor name.
   * If you want to execute all workers simply, use `execute` method.
   */
  public getWorkers<T = any>(
    meessage: QueueWorkerRawMessage<T> | QueueWorkerDecodedMessage<T> | Message<T>,
  ): Worker<T>[] {
    const decodedMessage = this.isDecodedMessage(meessage) ? meessage : decodeMessage(meessage);
    if (!decodedMessage.data.name) {
      return [];
    }

    return this.#allWorkers
      .filter((worker) => decodedMessage.data.name === worker.name)
      .map((metadata) => new Worker(decodedMessage, metadata, this.options));
  }

  private isDecodedMessage<T = any>(
    message: QueueWorkerRawMessage<T> | QueueWorkerDecodedMessage<T> | Message<T>,
  ): message is QueueWorkerDecodedMessage<T> {
    return "raw" in message;
  }
}

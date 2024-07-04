import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { QUEUE_WORKER_DECORATOR, QUEUE_WORKER_PROCESS_DECORATOR } from "./constants";
import {
  QueueWorkerDecoratorArgs,
  QueueWorkerMetadata,
  QueueWorkerProcessDecoratorArgs,
  QueueWorkerProcessorMetadata,
} from "./interfaces";
@Injectable()
export class QueueWorkerExplorerService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  public explore(): QueueWorkerMetadata[] {
    const workers = this.getWorkers();

    for (const worker of workers) {
      worker.processors = this.getQueueWorkerProcessors(worker);
    }

    return workers;
  }

  private getWorkers(): QueueWorkerMetadata[] {
    const metadata: QueueWorkerMetadata[] = [];
    for (const classInstanceWrapper of this.discoveryService
      .getProviders()
      .filter((instanceWrapper) => instanceWrapper.instance?.constructor)) {
      const args = Reflect.getMetadata(
        QUEUE_WORKER_DECORATOR,
        classInstanceWrapper.instance.constructor,
      ) as QueueWorkerDecoratorArgs;
      if (args && Array.isArray(args.names)) {
        if (args.enabled === false) {
          continue;
        }

        for (const name of args.names) {
          metadata.push({
            instance: classInstanceWrapper.instance,
            name,
            priority: args.priority || 0,
            processors: [],
          });
        }
      }
    }
    return metadata;
  }

  private getQueueWorkerProcessors(worker: QueueWorkerMetadata): QueueWorkerProcessorMetadata[] {
    const metadata: QueueWorkerProcessorMetadata[] = [];
    const instance = worker.instance;
    const prototype = Object.getPrototypeOf(instance);

    for (const methodName of this.metadataScanner.getAllMethodNames(prototype)) {
      const args = Reflect.getMetadata(
        QUEUE_WORKER_PROCESS_DECORATOR,
        prototype[methodName],
      ) as QueueWorkerProcessDecoratorArgs;
      if (args) {
        if (args.enabled === false) {
          continue;
        }
        metadata.push({
          priority: args.priority || 0,
          processor: prototype[methodName].bind(instance),
        });
      }
    }

    return metadata;
  }
}

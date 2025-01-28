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
import { sortByPriority } from "./util";
@Injectable()
export class QueueWorkerExplorerService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  public explore(): QueueWorkerMetadata[] {
    const workers = this.getWorkers();

    for (const worker of workers) {
      worker.processors = sortByPriority(this.getQueueWorkerProcessors(worker));
    }

    return sortByPriority(workers);
  }

  private getWorkers(): QueueWorkerMetadata[] {
    const metadata: QueueWorkerMetadata[] = [];
    for (const classInstanceWrapper of this.discoveryService.getProviders()) {
      const instance = classInstanceWrapper.instance;
      const metatype = classInstanceWrapper.metatype;

      if (!instance || !metatype) {
        continue;
      }

      const args = Reflect.getMetadata(QUEUE_WORKER_DECORATOR, instance.constructor) as QueueWorkerDecoratorArgs;
      
      if (args && Array.isArray(args.names)) {
        if (args.enabled === false) {
          continue;
        }

        for (const name of args.names) {
          metadata.push({
            className: metatype.name,
            instance: instance,
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
      const methodRef = instance[methodName];

      if (!methodRef) {
        continue;
      }

      const args = Reflect.getMetadata(QUEUE_WORKER_PROCESS_DECORATOR, methodRef) as QueueWorkerProcessDecoratorArgs;

      if (args) {
        if (args.enabled === false) {
          continue;
        }
        metadata.push({
          priority: args.priority || 0,
          processor: methodRef.bind(instance),
          methodName,
          workerName: worker.name,
          workerClassName: worker.className,
        });
      }
    }

    return metadata;
  }
}

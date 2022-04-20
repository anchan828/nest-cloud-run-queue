import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { CLOUD_RUN_PUBSUB_WORKER_DECORATOR, CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR } from "./constants";
import {
  CloudRunQueueWorkerDecoratorArgs,
  CloudRunQueueWorkerMetadata,
  CloudRunQueueWorkerProcessDecoratorArgs,
  CloudRunQueueWorkerProcessorMetadata,
} from "./interfaces";
@Injectable()
export class CloudRunQueueWorkerExplorerService {
  constructor(private readonly discoveryService: DiscoveryService, private readonly metadataScanner: MetadataScanner) {}

  public explore(): CloudRunQueueWorkerMetadata[] {
    const workers = this.getWorkers();

    for (const worker of workers) {
      worker.processors = this.getWorkerProcessors(worker);
    }

    return workers;
  }

  private getWorkers(): CloudRunQueueWorkerMetadata[] {
    const metadata: CloudRunQueueWorkerMetadata[] = [];
    for (const classInstanceWrapper of this.discoveryService
      .getProviders()
      .filter((instanceWrapper) => instanceWrapper.instance?.constructor)) {
      const args = Reflect.getMetadata(
        CLOUD_RUN_PUBSUB_WORKER_DECORATOR,
        classInstanceWrapper.instance.constructor,
      ) as CloudRunQueueWorkerDecoratorArgs;

      if (args) {
        metadata.push({
          instance: classInstanceWrapper.instance,
          name: args.name,
          priority: args.priority || 0,
          processors: [],
        });
      }
    }
    return metadata;
  }

  private getWorkerProcessors(worker: CloudRunQueueWorkerMetadata): CloudRunQueueWorkerProcessorMetadata[] {
    const metadata: CloudRunQueueWorkerProcessorMetadata[] = [];
    const instance = worker.instance;
    const prototype = Object.getPrototypeOf(instance);

    for (const methodName of this.metadataScanner.getAllFilteredMethodNames(prototype)) {
      const args = Reflect.getMetadata(
        CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR,
        prototype[methodName],
      ) as CloudRunQueueWorkerProcessDecoratorArgs;
      if (args) {
        metadata.push({
          priority: args.priority || 0,
          processor: prototype[methodName].bind(instance),
        });
      }
    }

    return metadata;
  }
}

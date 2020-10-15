import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { CLOUD_RUN_PUBSUB_WORKER_DECORATOR, CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR } from "./constants";
import {
  CloudRunPubSubWorkerDecoratorArgs,
  CloudRunPubSubWorkerMetadata,
  CloudRunPubSubWorkerProcessDecoratorArgs,
  CloudRunPubSubWorkerProcessorMetadata,
} from "./interfaces";
@Injectable()
export class CloudRunPubSubWorkerExplorerService {
  constructor(private readonly discoveryService: DiscoveryService, private readonly metadataScanner: MetadataScanner) {}

  public explore(): CloudRunPubSubWorkerMetadata[] {
    const workers = this.getWorkers();

    for (const worker of workers) {
      worker.processors = this.getWorkerProcessors(worker);
    }

    return workers;
  }

  private getWorkers(): CloudRunPubSubWorkerMetadata[] {
    const metadata: CloudRunPubSubWorkerMetadata[] = [];
    for (const classInstanceWrapper of this.discoveryService
      .getProviders()
      .filter((instanceWrapper) => instanceWrapper.instance?.constructor)) {
      const args = Reflect.getMetadata(
        CLOUD_RUN_PUBSUB_WORKER_DECORATOR,
        classInstanceWrapper.instance.constructor,
      ) as CloudRunPubSubWorkerDecoratorArgs;

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

  private getWorkerProcessors(worker: CloudRunPubSubWorkerMetadata): CloudRunPubSubWorkerProcessorMetadata[] {
    const metadata: CloudRunPubSubWorkerProcessorMetadata[] = [];
    const instance = worker.instance;
    const prototype = Object.getPrototypeOf(instance);

    for (const methodName of this.metadataScanner.getAllFilteredMethodNames(prototype)) {
      const args = Reflect.getMetadata(
        CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR,
        prototype[methodName],
      ) as CloudRunPubSubWorkerProcessDecoratorArgs;
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

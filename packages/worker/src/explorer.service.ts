import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { CLOUD_RUN_PUBSUB_WORKER_DECORATOR, CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR } from "./constants";
import { CloudRunPubSubWorkerMetadata, CloudRunPubSubWorkerProcessor } from "./interfaces";
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
      const name = Reflect.getMetadata(CLOUD_RUN_PUBSUB_WORKER_DECORATOR, classInstanceWrapper.instance.constructor);

      if (name) {
        metadata.push({ instance: classInstanceWrapper.instance, name, processors: [] });
      }
    }
    return metadata;
  }

  private getWorkerProcessors(worker: CloudRunPubSubWorkerMetadata): CloudRunPubSubWorkerProcessor[] {
    const instance = worker.instance;
    const prototype = Object.getPrototypeOf(instance);
    const workerProcessors: CloudRunPubSubWorkerProcessor[] = [];

    for (const methodName of this.metadataScanner.getAllFilteredMethodNames(prototype)) {
      if (Reflect.hasMetadata(CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR, prototype[methodName])) {
        workerProcessors.push(prototype[methodName].bind(instance));
      }
    }

    return workerProcessors;
  }
}

import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { DynamicModule, Logger, Module, Provider } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS } from "./constants";
import { CloudRunQueueWorkerExplorerService } from "./explorer.service";
import { CloudRunQueueWorkerModuleAsyncOptions, CloudRunQueueWorkerModuleOptions } from "./interfaces";
import { getWorkerController } from "./worker.controller";
import { CloudRunQueueWorkerService } from "./worker.service";
@Module({
  exports: [CloudRunQueueWorkerService],
  imports: [DiscoveryModule],
  providers: [
    MetadataScanner,
    CloudRunQueueWorkerExplorerService,
    CloudRunQueueWorkerService,
    { provide: Logger, useValue: new Logger("CloudRunQueueWorkerModule") },
  ],
})
export class CloudRunQueueWorkerModule {
  public static register(options: CloudRunQueueWorkerModuleOptions = {}): DynamicModule {
    const CloudRunQueueWorkerController = getWorkerController(options.workerController);
    const providers: Provider[] = [createOptionProvider(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS, options)];

    return {
      controllers: [CloudRunQueueWorkerController],
      global: true,
      module: CloudRunQueueWorkerModule,
      providers,
    };
  }

  public static registerAsync(options: CloudRunQueueWorkerModuleAsyncOptions): DynamicModule {
    const CloudRunQueueWorkerController = getWorkerController(options.workerController);
    const providers = [...createAsyncProviders(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS, options)];
    return {
      controllers: [CloudRunQueueWorkerController],
      global: true,
      imports: [...(options.imports || [])],
      module: CloudRunQueueWorkerModule,
      providers,
    };
  }
}

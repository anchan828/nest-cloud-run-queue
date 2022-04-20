import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { DynamicModule, Logger, Module, Provider } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS } from "./constants";
import { CloudRunWorkerExplorerService } from "./explorer.service";
import { CloudRunWorkerModuleAsyncOptions, CloudRunWorkerModuleOptions } from "./interfaces";
import { getWorkerController } from "./worker.controller";
import { CloudRunWorkerService } from "./worker.service";
@Module({
  exports: [CloudRunWorkerService],
  imports: [DiscoveryModule],
  providers: [
    MetadataScanner,
    CloudRunWorkerExplorerService,
    CloudRunWorkerService,
    { provide: Logger, useValue: new Logger("CloudRunWorkerModule") },
  ],
})
export class CloudRunWorkerModule {
  public static register(options: CloudRunWorkerModuleOptions = {}): DynamicModule {
    const CloudRunWorkerController = getWorkerController(options.workerController);
    const providers: Provider[] = [createOptionProvider(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS, options)];

    return {
      controllers: [CloudRunWorkerController],
      global: true,
      module: CloudRunWorkerModule,
      providers,
    };
  }

  public static registerAsync(options: CloudRunWorkerModuleAsyncOptions): DynamicModule {
    const CloudRunWorkerController = getWorkerController(options.workerController);
    const providers = [...createAsyncProviders(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS, options)];
    return {
      controllers: [CloudRunWorkerController],
      global: true,
      imports: [...(options.imports || [])],
      module: CloudRunWorkerModule,
      providers,
    };
  }
}

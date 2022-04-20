import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { DynamicModule, Logger, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS } from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import { CloudRunPubSubWorkerModuleAsyncOptions, CloudRunPubSubWorkerModuleOptions } from "./interfaces";
import { CloudRunPubSubWorkerController } from "./worker.controller";
import { CloudRunPubSubWorkerService } from "./worker.service";
@Module({
  controllers: [CloudRunPubSubWorkerController],
  exports: [CloudRunPubSubWorkerService],
  imports: [DiscoveryModule],
  providers: [
    MetadataScanner,
    CloudRunPubSubWorkerExplorerService,
    CloudRunPubSubWorkerService,
    { provide: Logger, useValue: new Logger("CloudRunPubSubWorkerModule") },
  ],
})
export class CloudRunPubSubWorkerModule {
  public static register(options: CloudRunPubSubWorkerModuleOptions = {}): DynamicModule {
    const providers = [createOptionProvider(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS, options)];
    return {
      exports: providers,
      global: true,
      module: CloudRunPubSubWorkerModule,
      providers,
    };
  }

  public static registerAsync(options: CloudRunPubSubWorkerModuleAsyncOptions): DynamicModule {
    const asyncProviders = [...createAsyncProviders(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS, options)];
    const providers = [...asyncProviders];
    return {
      exports: providers,
      global: true,
      imports: [...(options.imports || [])],
      module: CloudRunPubSubWorkerModule,
      providers,
    };
  }
}

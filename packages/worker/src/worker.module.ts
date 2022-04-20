import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { DynamicModule, Logger, Module, Provider } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { QUEUE_WORKER_MODULE_OPTIONS } from "./constants";
import { QueueWorkerExplorerService } from "./explorer.service";
import { QueueWorkerModuleAsyncOptions, QueueWorkerModuleOptions } from "./interfaces";
import { getWorkerController } from "./worker.controller";
import { QueueWorkerService } from "./worker.service";
@Module({
  exports: [QueueWorkerService],
  imports: [DiscoveryModule],
  providers: [
    MetadataScanner,
    QueueWorkerExplorerService,
    QueueWorkerService,
    { provide: Logger, useValue: new Logger("QueueWorkerModule") },
  ],
})
export class QueueWorkerModule {
  public static register(options: QueueWorkerModuleOptions = {}): DynamicModule {
    const WorkerController = getWorkerController(options.workerController);
    const providers: Provider[] = [createOptionProvider(QUEUE_WORKER_MODULE_OPTIONS, options)];

    return {
      controllers: [WorkerController],
      global: true,
      module: QueueWorkerModule,
      providers,
    };
  }

  public static registerAsync(options: QueueWorkerModuleAsyncOptions): DynamicModule {
    const WorkerController = getWorkerController(options.workerController);
    const providers = [...createAsyncProviders(QUEUE_WORKER_MODULE_OPTIONS, options)];
    return {
      controllers: [WorkerController],
      global: true,
      imports: [...(options.imports || [])],
      module: QueueWorkerModule,
      providers,
    };
  }
}

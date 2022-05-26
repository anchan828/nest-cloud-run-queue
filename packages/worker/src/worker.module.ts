import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-queue-common";
import { DynamicModule, Logger, Module, Provider, Type } from "@nestjs/common";
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
    const controllers: Type<any>[] = [];
    const providers: Provider[] = [createOptionProvider(QUEUE_WORKER_MODULE_OPTIONS, options)];

    if (options.workerController !== null) {
      const WorkerController = getWorkerController(options.workerController);
      controllers.push(WorkerController);
    }

    return {
      controllers,
      global: true,
      module: QueueWorkerModule,
      providers,
    };
  }

  public static registerAsync(options: QueueWorkerModuleAsyncOptions): DynamicModule {
    const controllers: Type<any>[] = [];
    const providers = [...createAsyncProviders(QUEUE_WORKER_MODULE_OPTIONS, options)];

    if (options.workerController !== null) {
      const WorkerController = getWorkerController(options.workerController);
      controllers.push(WorkerController);
    }

    return {
      controllers,
      global: true,
      imports: [...(options.imports || [])],
      module: QueueWorkerModule,
      providers,
    };
  }
}

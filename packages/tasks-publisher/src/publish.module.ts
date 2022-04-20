import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { CloudTasksClient } from "@google-cloud/tasks";
import { DynamicModule, Module } from "@nestjs/common";
import { FactoryProvider } from "@nestjs/common/interfaces";
import { CLOUD_RUN_TASKS_CLIENT, CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { CloudRunQueueTasksPublisherModuleAsyncOptions, CloudRunQueueTasksPublisherModuleOptions } from "./interfaces";
import { createClient } from "./providers";
import { CloudRunQueueTasksPublisherService } from "./publish.service";
@Module({})
export class CloudRunQueueTasksPublisherModule {
  public static register(options: CloudRunQueueTasksPublisherModuleOptions = {}): DynamicModule {
    const providers = [
      createOptionProvider(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunQueueTasksPublisherService,
      { provide: CLOUD_RUN_TASKS_CLIENT, useValue: createClient(options) },
    ];
    return {
      exports: providers,
      global: true,
      module: CloudRunQueueTasksPublisherModule,
      providers,
    };
  }

  public static registerAsync(options: CloudRunQueueTasksPublisherModuleAsyncOptions): DynamicModule {
    const asyncProviders = [
      ...createAsyncProviders(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunQueueTasksPublisherService,
      {
        inject: [CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS],
        provide: CLOUD_RUN_TASKS_CLIENT,
        useFactory: (options: CloudRunQueueTasksPublisherModuleOptions): CloudTasksClient => createClient(options),
      } as FactoryProvider,
    ];
    const providers = [...asyncProviders];
    return {
      exports: providers,
      global: true,
      imports: [...(options.imports || [])],
      module: CloudRunQueueTasksPublisherModule,
      providers,
    };
  }
}

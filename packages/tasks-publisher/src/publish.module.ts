import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { CloudTasksClient } from "@google-cloud/tasks";
import { DynamicModule, Module } from "@nestjs/common";
import { FactoryProvider } from "@nestjs/common/interfaces";
import { CLOUD_RUN_TASKS_CLIENT, CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { CloudRunTasksPublisherModuleAsyncOptions, CloudRunTasksPublisherModuleOptions } from "./interfaces";
import { createClient } from "./providers";
import { CloudRunTasksPublisherService } from "./publish.service";
@Module({})
export class CloudRunTasksPublisherModule {
  public static register(options: CloudRunTasksPublisherModuleOptions = {}): DynamicModule {
    const providers = [
      createOptionProvider(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunTasksPublisherService,
      { provide: CLOUD_RUN_TASKS_CLIENT, useValue: createClient(options) },
    ];
    return {
      exports: providers,
      global: true,
      module: CloudRunTasksPublisherModule,
      providers,
    };
  }

  public static registerAsync(options: CloudRunTasksPublisherModuleAsyncOptions): DynamicModule {
    const asyncProviders = [
      ...createAsyncProviders(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunTasksPublisherService,
      {
        inject: [CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS],
        provide: CLOUD_RUN_TASKS_CLIENT,
        useFactory: (options: CloudRunTasksPublisherModuleOptions): CloudTasksClient => createClient(options),
      } as FactoryProvider,
    ];
    const providers = [...asyncProviders];
    return {
      exports: providers,
      global: true,
      imports: [...(options.imports || [])],
      module: CloudRunTasksPublisherModule,
      providers,
    };
  }
}

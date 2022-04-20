import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-queue-common";
import { CloudTasksClient } from "@google-cloud/tasks";
import { DynamicModule, Module } from "@nestjs/common";
import { FactoryProvider } from "@nestjs/common/interfaces";
import { TASKS_CLIENT, TASKS_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { TasksPublisherModuleAsyncOptions, TasksPublisherModuleOptions } from "./interfaces";
import { createClient } from "./providers";
import { TasksPublisherService } from "./publish.service";
@Module({})
export class TasksPublisherModule {
  public static register(options: TasksPublisherModuleOptions = {}): DynamicModule {
    const providers = [
      createOptionProvider(TASKS_PUBLISHER_MODULE_OPTIONS, options),
      TasksPublisherService,
      { provide: TASKS_CLIENT, useValue: createClient(options) },
    ];
    return {
      exports: providers,
      global: true,
      module: TasksPublisherModule,
      providers,
    };
  }

  public static registerAsync(options: TasksPublisherModuleAsyncOptions): DynamicModule {
    const asyncProviders = [
      ...createAsyncProviders(TASKS_PUBLISHER_MODULE_OPTIONS, options),
      TasksPublisherService,
      {
        inject: [TASKS_PUBLISHER_MODULE_OPTIONS],
        provide: TASKS_CLIENT,
        useFactory: (options: TasksPublisherModuleOptions): CloudTasksClient => createClient(options),
      } as FactoryProvider,
    ];
    const providers = [...asyncProviders];
    return {
      exports: providers,
      global: true,
      imports: [...(options.imports || [])],
      module: TasksPublisherModule,
      providers,
    };
  }
}

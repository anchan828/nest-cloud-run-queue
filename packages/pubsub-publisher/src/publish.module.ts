import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { PubSub } from "@google-cloud/pubsub";
import { DynamicModule, Module } from "@nestjs/common";
import { FactoryProvider } from "@nestjs/common/interfaces";
import { CLOUD_RUN_PUBSUB, CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS } from "./constants";
import {
  CloudRunQueuePubSubPublisherModuleAsyncOptions,
  CloudRunQueuePubSubPublisherModuleOptions,
} from "./interfaces";
import { createPubSub } from "./providers";
import { CloudRunQueuePubSubPublisherService } from "./publish.service";
@Module({})
export class CloudRunQueuePubSubPublisherModule {
  public static register(options: CloudRunQueuePubSubPublisherModuleOptions = {}): DynamicModule {
    const providers = [
      createOptionProvider(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunQueuePubSubPublisherService,
      { provide: CLOUD_RUN_PUBSUB, useValue: createPubSub(options) },
    ];
    return {
      exports: providers,
      global: true,
      module: CloudRunQueuePubSubPublisherModule,
      providers,
    };
  }

  public static registerAsync(options: CloudRunQueuePubSubPublisherModuleAsyncOptions): DynamicModule {
    const asyncProviders = [
      ...createAsyncProviders(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunQueuePubSubPublisherService,
      {
        inject: [CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS],
        provide: CLOUD_RUN_PUBSUB,
        useFactory: (options: CloudRunQueuePubSubPublisherModuleOptions): PubSub => createPubSub(options),
      } as FactoryProvider,
    ];
    const providers = [...asyncProviders];
    return {
      exports: providers,
      global: true,
      imports: [...(options.imports || [])],
      module: CloudRunQueuePubSubPublisherModule,
      providers,
    };
  }
}

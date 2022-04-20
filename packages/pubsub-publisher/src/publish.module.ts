import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-common";
import { PubSub } from "@google-cloud/pubsub";
import { DynamicModule, Module } from "@nestjs/common";
import { FactoryProvider } from "@nestjs/common/interfaces";
import { CLOUD_RUN_PUBSUB, CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { CloudRunPubSubPublisherModuleAsyncOptions, CloudRunPubSubPublisherModuleOptions } from "./interfaces";
import { createPubSub } from "./providers";
import { CloudRunPubSubPublisherService } from "./publish.service";
@Module({})
export class CloudRunPubSubPublisherModule {
  public static register(options: CloudRunPubSubPublisherModuleOptions = {}): DynamicModule {
    const providers = [
      createOptionProvider(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunPubSubPublisherService,
      { provide: CLOUD_RUN_PUBSUB, useValue: createPubSub(options) },
    ];
    return {
      exports: providers,
      global: true,
      module: CloudRunPubSubPublisherModule,
      providers,
    };
  }

  public static registerAsync(options: CloudRunPubSubPublisherModuleAsyncOptions): DynamicModule {
    const asyncProviders = [
      ...createAsyncProviders(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS, options),
      CloudRunPubSubPublisherService,
      {
        inject: [CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS],
        provide: CLOUD_RUN_PUBSUB,
        useFactory: (options: CloudRunPubSubPublisherModuleOptions): PubSub => createPubSub(options),
      } as FactoryProvider,
    ];
    const providers = [...asyncProviders];
    return {
      exports: providers,
      global: true,
      imports: [...(options.imports || [])],
      module: CloudRunPubSubPublisherModule,
      providers,
    };
  }
}

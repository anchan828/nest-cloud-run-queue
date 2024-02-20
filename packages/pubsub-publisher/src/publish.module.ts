import { createAsyncProviders, createOptionProvider } from "@anchan828/nest-cloud-run-queue-common";
import { PubSub } from "@google-cloud/pubsub";
import { DynamicModule, Module } from "@nestjs/common";
import { FactoryProvider } from "@nestjs/common/interfaces";
import { PUBSUB, PUBSUB_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { PubSubPublisherModuleAsyncOptions, PubSubPublisherModuleOptions } from "./interfaces";
import { createPubSub } from "./providers";
import { PubSubPublisherService } from "./publish.service";
@Module({})
export class PubSubPublisherModule {
  public static register(options: PubSubPublisherModuleOptions = {}): DynamicModule {
    const providers = [
      createOptionProvider(PUBSUB_PUBLISHER_MODULE_OPTIONS, options),
      PubSubPublisherService,
      { provide: PUBSUB, useFactory: () => createPubSub(options) },
    ];
    return {
      exports: providers,
      global: true,
      module: PubSubPublisherModule,
      providers,
    };
  }

  public static registerAsync(options: PubSubPublisherModuleAsyncOptions): DynamicModule {
    const asyncProviders = [
      ...createAsyncProviders(PUBSUB_PUBLISHER_MODULE_OPTIONS, options),
      PubSubPublisherService,
      {
        inject: [PUBSUB_PUBLISHER_MODULE_OPTIONS],
        provide: PUBSUB,
        useFactory: (options: PubSubPublisherModuleOptions): PubSub => createPubSub(options),
      } as FactoryProvider,
    ];
    const providers = [...asyncProviders];
    return {
      exports: providers,
      global: true,
      imports: [...(options.imports || [])],
      module: PubSubPublisherModule,
      providers,
    };
  }
}

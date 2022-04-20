import {
  Message,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
  PublishExtraConfig,
} from "@anchan828/nest-cloud-run-queue-common";
import { Attributes } from "@google-cloud/pubsub";
import { ClientConfig } from "@google-cloud/pubsub/build/src/pubsub";
import { PublishOptions } from "@google-cloud/pubsub/build/src/topic";

export interface PubSubPublisherModuleOptions extends ModuleOptions {
  // default topic
  topic?: string;
  clientConfig?: ClientConfig;
  publishConfig?: PublishOptions;
  extraConfig?: PublishExtraConfig<PublishData<any>>;
}
export type PubSubPublisherModuleAsyncOptions = ModuleAsyncOptions<PubSubPublisherModuleOptions>;

export type PubSubPublisherModuleOptionsFactory = ModuleOptionsFactory<PubSubPublisherModuleOptions>;

export interface PublishData<T> extends Message<T> {
  attributes?: Attributes;
}

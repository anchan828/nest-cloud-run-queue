import {
  CloudRunQueueMessage,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
  PublishExtraConfig,
} from "@anchan828/nest-cloud-run-common";
import { Attributes } from "@google-cloud/pubsub";
import { ClientConfig } from "@google-cloud/pubsub/build/src/pubsub";
import { PublishOptions } from "@google-cloud/pubsub/build/src/topic";

export interface CloudRunPubSubPublisherModuleOptions extends ModuleOptions {
  // default topic
  topic?: string;
  clientConfig?: ClientConfig;
  publishConfig?: PublishOptions;
  extraConfig?: PublishExtraConfig<PublishData<any>>;
}
export type CloudRunPubSubPublisherModuleAsyncOptions = ModuleAsyncOptions<CloudRunPubSubPublisherModuleOptions>;

export type CloudRunPubSubPublisherModuleOptionsFactory = ModuleOptionsFactory<CloudRunPubSubPublisherModuleOptions>;

export interface PublishData<T> extends CloudRunQueueMessage<T> {
  attributes?: Attributes;
}

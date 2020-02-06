import {
  CloudRunPubSubMessage,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
} from "@anchan828/nest-cloud-run-pubsub-common";
import { Attributes } from "@google-cloud/pubsub";
import { ClientConfig } from "@google-cloud/pubsub/build/src/pubsub";
import { PublishOptions } from "@google-cloud/pubsub/build/src/topic";

export interface CloudRunPubSubPublisherModuleOptions extends ModuleOptions {
  // default topic
  topic?: string;
  clientConfig?: ClientConfig;
  publishConfig?: PublishOptions;
}
export type CloudRunPubSubPublisherModuleAsyncOptions = ModuleAsyncOptions<CloudRunPubSubPublisherModuleOptions>;

export type CloudRunPubSubPublisherModuleOptionsFactory = ModuleOptionsFactory<CloudRunPubSubPublisherModuleOptions>;

export type PublishData<T> = CloudRunPubSubMessage<T> & { attributes?: Attributes };

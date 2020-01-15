import {
  CloudRunPubSubMessage,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
} from "@anchan828/nest-cloud-run-pubsub-common";
import { Attributes } from "@google-cloud/pubsub";
import { ClientConfig } from "@google-cloud/pubsub/build/src/pubsub";

export interface CloudRunPubSubPublisherModuleOptions extends ClientConfig, ModuleOptions {
  // default topic
  topic?: string;
}
export type CloudRunPubSubPublisherModuleAsyncOptions = ModuleAsyncOptions<CloudRunPubSubPublisherModuleOptions>;

export type CloudRunPubSubPublisherModuleOptionsFactory = ModuleOptionsFactory<CloudRunPubSubPublisherModuleOptions>;

export type PublishData<T extends string | object> = CloudRunPubSubMessage<T> & { attributes?: Attributes };

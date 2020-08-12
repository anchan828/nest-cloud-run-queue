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

  extraConfig?: ExtraConfig;
}
export type CloudRunPubSubPublisherModuleAsyncOptions = ModuleAsyncOptions<CloudRunPubSubPublisherModuleOptions>;

export type CloudRunPubSubPublisherModuleOptionsFactory = ModuleOptionsFactory<CloudRunPubSubPublisherModuleOptions>;

export type PublishData<T> = CloudRunPubSubMessage<T> & { attributes?: Attributes };

export type ExtraConfig = {
  // Run BEFORE the message is published
  prePublish?: (message: PublishData<any>) => PublishData<any> | Promise<PublishData<any>>;
  // Run AFTER the message is published
  postPublish?: (message: PublishData<any>, messageId: string) => void | Promise<void>;
};

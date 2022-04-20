import { PubSub } from "@google-cloud/pubsub";
import { CloudRunQueuePubSubPublisherModuleOptions } from "./interfaces";

export function createPubSub(options: CloudRunQueuePubSubPublisherModuleOptions): PubSub {
  return new PubSub(options.clientConfig);
}

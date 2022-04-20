import { PubSub } from "@google-cloud/pubsub";
import { PubSubPublisherModuleOptions } from "./interfaces";

export function createPubSub(options: PubSubPublisherModuleOptions): PubSub {
  return new PubSub(options.clientConfig);
}

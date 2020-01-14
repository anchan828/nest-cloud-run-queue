import { PubSub } from "@google-cloud/pubsub";
import { CloudRunPubSubPublisherModuleOptions } from "./interfaces";

export function createPubSub(options: CloudRunPubSubPublisherModuleOptions): PubSub {
  return new PubSub(options);
}

import { PubSub } from "@google-cloud/pubsub";
import { PublishOptions } from "@google-cloud/pubsub/build/src/topic";
import { Inject, Injectable } from "@nestjs/common";
import { CLOUD_RUN_PUBSUB, CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS, ERROR_TOPIC_NOT_FOUND } from "./constants";
import { CloudRunPubSubPublisherModuleOptions, PublishData } from "./interfaces";

@Injectable()
export class CloudRunPubSubService {
  constructor(
    @Inject(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS) private readonly options: CloudRunPubSubPublisherModuleOptions,
    @Inject(CLOUD_RUN_PUBSUB) private readonly pubsub: PubSub,
  ) {}

  public async publish<T>(message: PublishData<T>, options?: PublishOptions & { topic?: string }): Promise<string> {
    const { attributes, ...json } = message;
    const topicName = this.getTopicName(options);
    const topic = this.pubsub.topic(topicName, options);
    return topic.publishJSON(json, attributes);
  }

  private getTopicName(options?: { topic?: string }): string {
    const topic = this.options.topic || options?.topic;
    if (!topic) {
      throw new Error(ERROR_TOPIC_NOT_FOUND);
    }
    return topic;
  }
}

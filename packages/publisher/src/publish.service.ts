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
    const topicName = this.getTopicName(options);
    const topic = this.pubsub.topic(topicName, Object.assign({}, this.options.publishConfig, options));

    const { attributes, ...json } = this.options.extraConfig?.prePublish
      ? await this.options.extraConfig?.prePublish(message)
      : message;

    const messageId = await topic.publishJSON(json, attributes);

    if (this.options.extraConfig?.postPublish) {
      await this.options.extraConfig?.postPublish(message, messageId);
    }

    return messageId;
  }

  private getTopicName(options?: { topic?: string }): string {
    const topic = this.options.topic || options?.topic;
    if (!topic) {
      throw new Error(ERROR_TOPIC_NOT_FOUND);
    }
    return topic;
  }
}

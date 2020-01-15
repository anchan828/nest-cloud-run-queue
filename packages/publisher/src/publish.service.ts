import { CloudRunPubSubMessage } from "@anchan828/nest-cloud-run-pubsub-common";
import { Attributes, PubSub } from "@google-cloud/pubsub";
import { PublishOptions } from "@google-cloud/pubsub/build/src/topic";
import { Inject, Injectable } from "@nestjs/common";
import { CLOUD_RUN_PUBSUB, CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS, ERROR_TOPIC_NOT_FOUND } from "./constants";
import { CloudRunPubSubPublisherModuleOptions } from "./interfaces";

@Injectable()
export class CloudRunPubSubService {
  constructor(
    @Inject(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS) private readonly options: CloudRunPubSubPublisherModuleOptions,
    @Inject(CLOUD_RUN_PUBSUB) public readonly pubsub: PubSub,
  ) {}

  public async publish(
    message: CloudRunPubSubMessage,
    attributes?: Attributes,
    options?: PublishOptions & { topic?: string },
  ): Promise<string> {
    const topicName = this.getTopicName(options);
    const topic = this.pubsub.topic(topicName, options);
    return topic.publishJSON(message, attributes);
  }

  private getTopicName(options?: { topic?: string }): string {
    const topic = this.options.topic || options?.topic;
    if (!topic) {
      throw new Error(ERROR_TOPIC_NOT_FOUND);
    }
    return topic;
  }
}

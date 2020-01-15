import { PubSub } from "@google-cloud/pubsub";

/**
 * Return created topic name
 *
 * @param {PubSub} pubsub
 * @returns {string}
 */
export async function createTopic(pubsub: PubSub): Promise<string> {
  const topicName = `topic-${Date.now()}`;
  await pubsub.createTopic(topicName).catch();
  return topicName;
}

export async function createTopicAndSubscription(pubsub: PubSub): Promise<string> {
  const topicName = await createTopic(pubsub);
  const topic = await pubsub.topic(topicName).get();
  await topic[0].createSubscription(`${topicName}-subscription`, { pushEndpoint: "http://receiver:4363" }).catch();

  return topicName;
}

it("should be defined", () => expect(createTopic).toBeDefined());

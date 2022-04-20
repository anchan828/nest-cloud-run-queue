import { PubSub } from "@google-cloud/pubsub";
import { Test, TestingModule } from "@nestjs/testing";
import { PUBSUB, ERROR_TOPIC_NOT_FOUND } from "./constants";
import { PublishData } from "./interfaces";
import { PubSubPublisherModule } from "./publish.module";
import { PubSubPublisherService } from "./publish.service";
describe("PubSubPublisherService", () => {
  let service: PubSubPublisherService;
  let app: TestingModule;
  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [PubSubPublisherModule.register()],
    }).compile();
    service = app.get<PubSubPublisherService>(PubSubPublisherService);

    const pubsub = app.get<PubSub>(PUBSUB);

    jest.spyOn(pubsub, "topic").mockReturnValue({
      publishMessage: jest.fn(async () => "messageId"),
    } as any);
  });

  describe("publish", () => {
    it("should be defined", () => {
      expect(service.publish).toBeDefined();
    });
    it("should throw error if topic not found", async () => {
      await expect(service.publish({ data: "data", name: "test" })).rejects.toThrowError(ERROR_TOPIC_NOT_FOUND);
    });

    it("should publish message without data", async () => {
      const topicName = "test";
      await expect(service.publish({ name: "test" }, { topic: topicName })).resolves.toEqual(expect.any(String));
    });

    it("should publish message", async () => {
      const topicName = "test";
      await expect(service.publish({ data: { test: "test" }, name: "test" }, { topic: topicName })).resolves.toEqual(
        expect.any(String),
      );
    });

    it("should publish message with attributes", async () => {
      const topicName = "test";
      await expect(
        service.publish({ attributes: { attr: "attr" }, data: { test: "test" }, name: "test" }, { topic: topicName }),
      ).resolves.toEqual(expect.any(String));
    });

    it("should publish message with attributes", async () => {
      const topicName = "test";
      await expect(
        service.publish({ attributes: { attr: "attr" }, data: { test: "test" }, name: "test" }, { topic: topicName }),
      ).resolves.toEqual(expect.any(String));
    });
  });
});

describe("PubSubPublisherService [extra configs]", () => {
  describe("prepublish", () => {
    it("should customize message", async () => {
      const app = await Test.createTestingModule({
        imports: [
          PubSubPublisherModule.register({
            extraConfig: {
              prePublish: (message: PublishData<string>): PublishData<string> => {
                expect(message).toEqual({ data: "data", name: "test" });
                message.data = "changed";
                message.attributes = { id: "1" };
                return message;
              },
            },
          }),
        ],
      }).compile();
      jest.spyOn(app.get<PubSub>(PUBSUB), "topic").mockReturnValue({
        publishMessage: jest.fn(async () => "messageId"),
      } as any);
      const service = app.get<PubSubPublisherService>(PubSubPublisherService);
      const topicName = "test";
      const message: PublishData<string> = { data: "data", name: "test" };
      await service.publish(message, { topic: topicName });
      expect(message).toEqual({ attributes: { id: "1" }, data: "changed", name: "test" });
    });
  });

  describe("postpublish", () => {
    it("should call postpublish", async () => {
      const mock = jest.fn();
      const app = await Test.createTestingModule({
        imports: [
          PubSubPublisherModule.register({
            extraConfig: {
              postPublish: mock,
            },
          }),
        ],
      }).compile();
      jest.spyOn(app.get<PubSub>(PUBSUB), "topic").mockReturnValue({
        publishMessage: jest.fn(async () => "messageId"),
      } as any);
      const service = app.get<PubSubPublisherService>(PubSubPublisherService);
      const topicName = "test";
      await service.publish({ data: "data", name: "test" }, { topic: topicName });
      expect(mock).toHaveBeenLastCalledWith({ data: "data", name: "test" }, expect.any(String));
    });
  });
});

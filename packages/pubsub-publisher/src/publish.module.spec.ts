import { PubSub } from "@google-cloud/pubsub";
import { Test } from "@nestjs/testing";
import { CLOUD_RUN_PUBSUB, CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { CloudRunQueuePubSubPublisherModuleOptions } from "./interfaces";
import { CloudRunQueuePubSubPublisherModule } from "./publish.module";
import { CloudRunQueuePubSubPublisherService } from "./publish.service";
describe("CloudRunQueuePubSubPublisherModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunQueuePubSubPublisherModule.register()],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunQueuePubSubPublisherService>(CloudRunQueuePubSubPublisherService)).toBeDefined();
    expect(app.get<PubSub>(CLOUD_RUN_PUBSUB)).toBeDefined();
    expect(app.get<CloudRunQueuePubSubPublisherModuleOptions>(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunQueuePubSubPublisherModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunQueuePubSubPublisherService>(CloudRunQueuePubSubPublisherService)).toBeDefined();
    expect(app.get<PubSub>(CLOUD_RUN_PUBSUB)).toBeDefined();
    expect(app.get<CloudRunQueuePubSubPublisherModuleOptions>(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });
});

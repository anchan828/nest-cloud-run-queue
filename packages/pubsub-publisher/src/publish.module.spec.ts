import { PubSub } from "@google-cloud/pubsub";
import { Test } from "@nestjs/testing";
import { CLOUD_RUN_PUBSUB, CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { CloudRunPubSubPublisherModuleOptions } from "./interfaces";
import { CloudRunPubSubPublisherModule } from "./publish.module";
import { CloudRunPubSubPublisherService } from "./publish.service";
describe("CloudRunPubSubPublisherModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubPublisherModule.register()],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunPubSubPublisherService>(CloudRunPubSubPublisherService)).toBeDefined();
    expect(app.get<PubSub>(CLOUD_RUN_PUBSUB)).toBeDefined();
    expect(app.get<CloudRunPubSubPublisherModuleOptions>(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunPubSubPublisherModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunPubSubPublisherService>(CloudRunPubSubPublisherService)).toBeDefined();
    expect(app.get<PubSub>(CLOUD_RUN_PUBSUB)).toBeDefined();
    expect(app.get<CloudRunPubSubPublisherModuleOptions>(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });
});

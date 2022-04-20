import { PubSub } from "@google-cloud/pubsub";
import { Test } from "@nestjs/testing";
import { PUBSUB, PUBSUB_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { PubSubPublisherModuleOptions } from "./interfaces";
import { PubSubPublisherModule } from "./publish.module";
import { PubSubPublisherService } from "./publish.service";
describe("PubSubPublisherModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [PubSubPublisherModule.register()],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<PubSubPublisherService>(PubSubPublisherService)).toBeDefined();
    expect(app.get<PubSub>(PUBSUB)).toBeDefined();
    expect(app.get<PubSubPublisherModuleOptions>(PUBSUB_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        PubSubPublisherModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<PubSubPublisherService>(PubSubPublisherService)).toBeDefined();
    expect(app.get<PubSub>(PUBSUB)).toBeDefined();
    expect(app.get<PubSubPublisherModuleOptions>(PUBSUB_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });
});

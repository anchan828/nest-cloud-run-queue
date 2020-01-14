import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS } from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import { CloudRunPubSubWorkerModuleOptions } from "./interfaces";
import { CloudRunPubSubWorkerController } from "./worker.controller";
import { CloudRunPubSubWorkerModule } from "./worker.module";
describe("CloudRunPubSubWorkerModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubWorkerModule.register({})],
    }).compile();
    expect(app).toBeDefined();
    expect(app.get<CloudRunPubSubWorkerController>(CloudRunPubSubWorkerController)).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService)).toBeDefined();
    expect(app.get<CloudRunPubSubWorkerModuleOptions>(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunPubSubWorkerModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunPubSubWorkerController>(CloudRunPubSubWorkerController)).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService)).toBeDefined();
    expect(app.get<CloudRunPubSubWorkerModuleOptions>(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)).toBeDefined();
  });
});

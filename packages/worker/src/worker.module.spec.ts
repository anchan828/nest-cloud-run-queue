import { Logger } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS } from "./constants";
import { CloudRunQueueWorkerExplorerService } from "./explorer.service";
import { CloudRunQueueWorkerModuleOptions } from "./interfaces";
import { CloudRunQueueWorkerModule } from "./worker.module";
describe("CloudRunQueueWorkerModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunQueueWorkerModule.register({})],
    }).compile();
    expect(app).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<CloudRunQueueWorkerExplorerService>(CloudRunQueueWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<CloudRunQueueWorkerModuleOptions>(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunQueueWorkerModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<CloudRunQueueWorkerExplorerService>(CloudRunQueueWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<CloudRunQueueWorkerModuleOptions>(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)).toBeDefined();
  });
});

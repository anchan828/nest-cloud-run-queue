import { Logger } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS } from "./constants";
import { CloudRunWorkerExplorerService } from "./explorer.service";
import { CloudRunWorkerModuleOptions } from "./interfaces";
import { CloudRunWorkerModule } from "./worker.module";
describe("CloudRunWorkerModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunWorkerModule.register({})],
    }).compile();
    expect(app).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<CloudRunWorkerModuleOptions>(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunWorkerModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<CloudRunWorkerModuleOptions>(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS)).toBeDefined();
  });
});

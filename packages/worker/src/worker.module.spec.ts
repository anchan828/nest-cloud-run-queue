import { Logger } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { QUEUE_WORKER_MODULE_OPTIONS } from "./constants";
import { QueueWorkerExplorerService } from "./explorer.service";
import { QueueWorkerModuleOptions } from "./interfaces";
import { QueueWorkerModule } from "./worker.module";
describe("QueueWorkerModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [QueueWorkerModule.register({})],
    }).compile();
    expect(app).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<QueueWorkerModuleOptions>(QUEUE_WORKER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        QueueWorkerModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<QueueWorkerModuleOptions>(QUEUE_WORKER_MODULE_OPTIONS)).toBeDefined();
  });
});

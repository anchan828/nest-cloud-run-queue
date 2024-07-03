import { Body, Controller, Logger, Post, RequestMethod } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { QUEUE_WORKER_MODULE_OPTIONS } from "./constants";
import { QueueWorkerExplorerService } from "./explorer.service";
import { QueueWorkerModuleOptions, QueueWorkerReceivedMessage } from "./interfaces";
import { QueueWorkerModule } from "./worker.module";
import { QueueWorkerService } from "./worker.service";

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
    expect(app.get(QueueWorkerService)).toBeDefined();
  });

  it("should use custom controller", async () => {
    @Controller("/worker")
    class WorkerController {
      constructor(private readonly service: QueueWorkerService) {}

      @Post()
      public async execute(@Body() body: QueueWorkerReceivedMessage): Promise<void> {
        await this.service.execute({ ...body.message });
      }
    }

    const app = await Test.createTestingModule({
      controllers: [WorkerController],
      imports: [QueueWorkerModule.register({ workerController: null })],
    }).compile();
    expect(app).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<QueueWorkerModuleOptions>(QUEUE_WORKER_MODULE_OPTIONS)).toBeDefined();
    expect(app.get<WorkerController>(WorkerController)).toBeDefined();
    expect(app.get(QueueWorkerService)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        QueueWorkerModule.registerAsync({
          useFactory: () => ({}),
          workerController: {
            method: RequestMethod.GET,
            path: "/worker",
          },
        }),
      ],
    }).compile();
    expect(app).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<QueueWorkerModuleOptions>(QUEUE_WORKER_MODULE_OPTIONS)).toBeDefined();
    expect(app.get(QueueWorkerService)).toBeDefined();
  });

  it("should use custom controller", async () => {
    @Controller("/worker")
    class WorkerController {
      constructor(private readonly service: QueueWorkerService) {}

      @Post()
      public async execute(@Body() body: QueueWorkerReceivedMessage): Promise<void> {
        await this.service.execute({ ...body.message });
      }
    }

    const app = await Test.createTestingModule({
      controllers: [WorkerController],
      imports: [QueueWorkerModule.register({ workerController: null })],
    }).compile();
    expect(app).toBeDefined();
    expect(app.get<MetadataScanner>(MetadataScanner)).toBeDefined();
    expect(app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService)).toBeDefined();
    expect(app.get<Logger>(Logger)).toBeDefined();
    expect(app.get<QueueWorkerModuleOptions>(QUEUE_WORKER_MODULE_OPTIONS)).toBeDefined();
    expect(app.get<WorkerController>(WorkerController)).toBeDefined();
    expect(app.get(QueueWorkerService)).toBeDefined();
  });
});

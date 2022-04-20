import { CloudRunQueueMessage } from "@anchan828/nest-cloud-run-common";
import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
  CLOUD_RUN_UNHANDLED_WORKER_NAME,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
} from "./constants";
import { CloudRunWorkerExplorerService } from "./explorer.service";
import {
  CloudRunWorkerRawMessage,
  CloudRunWorkerMetadata,
  CloudRunWorkerProcessor,
  CloudRunWorkerProcessorMetadata,
} from "./interfaces";
import { CloudRunWorkerModule } from "./worker.module";
import { CloudRunWorkerService } from "./worker.service";

function toBase64(json: object | string): string {
  if (typeof json === "object") {
    json = JSON.stringify(json);
  }

  return Buffer.from(json).toString("base64");
}

describe("CloudRunWorkerService", () => {
  let service: CloudRunWorkerService;
  let explorerService: CloudRunWorkerExplorerService;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunWorkerModule.register({ throwModuleError: true })],
    }).compile();
    service = app.get<CloudRunWorkerService>(CloudRunWorkerService);
    explorerService = app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(explorerService).toBeDefined();
  });
  it("should ignore error if data invalid", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunWorkerModule.registerAsync({ useFactory: () => ({} as any) })],
    }).compile();
    service = app.get<CloudRunWorkerService>(CloudRunWorkerService);
    explorerService = app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService);
    await expect(service.execute({ data: "invalid" } as CloudRunWorkerRawMessage)).resolves.toBeUndefined();
  });
  it("should throw error if data invalid", async () => {
    await expect(service.execute({ data: "invalid" } as CloudRunWorkerRawMessage)).rejects.toThrowError(
      new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT),
    );
  });

  it("should throw error if data is null", async () => {
    await expect(service.execute({ data: null } as CloudRunWorkerRawMessage)).rejects.toThrowError(
      new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT),
    );
  });

  it("should throw error if data is not message object", async () => {
    await expect(
      service.execute({ data: toBase64("testtest"), messageId: "1" } as CloudRunWorkerRawMessage),
    ).rejects.toThrowError(new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT));
  });

  it("should throw error if message dosen't have name", async () => {
    await expect(
      service.execute({ data: toBase64({ data: "data" } as CloudRunQueueMessage), messageId: "1" }),
    ).rejects.toThrowError(new BadRequestException(ERROR_WORKER_NAME_NOT_FOUND));
  });

  it("should throw error if worker not found", async () => {
    await expect(
      service.execute({ data: toBase64({ name: "name" } as CloudRunQueueMessage), messageId: "1" }),
    ).rejects.toThrowError(new BadRequestException(ERROR_WORKER_NOT_FOUND("name")));
  });

  it("should run processor if worker found (data is base64)", async () => {
    const processor: CloudRunWorkerProcessor = (message: any, raw: any) => {
      expect(message).toEqual({ date: expect.any(Date), prop: 1 });
      expect(raw).toEqual({ attributes: { attr: 2 }, data: expect.anything(), messageId: "1" });
    };
    const processorMock = jest.fn().mockImplementation((): void => {
      throw new Error();
    });
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        priority: 0,
        processors: [
          { priority: 0, processor },
          { priority: 1, processor: processorMock },
        ],
      },
    ] as CloudRunWorkerMetadata[]);
    await expect(
      service.execute({
        attributes: { attr: 2 },
        data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
        messageId: "1",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toBeCalledTimes(1);
  });
  it("should run processor if worker found (data is buffer)", async () => {
    const processor: CloudRunWorkerProcessor = (message: any, raw: any) => {
      expect(message).toEqual({ date: expect.any(Date), prop: 1 });
      expect(raw).toEqual({ attributes: { attr: 2 }, data: expect.anything(), messageId: "1" });
    };
    const processorMock = jest.fn().mockImplementation((): void => {
      throw new Error();
    });
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        priority: 0,
        processors: [
          { priority: 0, processor },
          { priority: 1, processor: processorMock },
        ],
      },
    ] as CloudRunWorkerMetadata[]);
    await expect(
      service.execute({
        attributes: { attr: 2 },
        data: Buffer.from(JSON.stringify({ data: { date: new Date(), prop: 1 }, name: "name" })),
        messageId: "1",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toBeCalledTimes(1);
  });

  it("should run processor if worker found (data is Uint8Array)", async () => {
    const processor: CloudRunWorkerProcessor = (message: any, raw: any) => {
      expect(message).toEqual({ date: expect.any(Date), prop: 1 });
      expect(raw).toEqual({ attributes: { attr: 2 }, data: expect.anything(), messageId: "1" });
    };
    const processorMock = jest.fn().mockImplementation((): void => {
      throw new Error();
    });
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        priority: 0,
        processors: [
          { priority: 0, processor },
          { priority: 1, processor: processorMock },
        ],
      },
    ] as CloudRunWorkerMetadata[]);
    await expect(
      service.execute({
        attributes: { attr: 2 },
        data: new TextEncoder().encode(JSON.stringify({ data: { date: new Date(), prop: 1 }, name: "name" })),
        messageId: "1",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toBeCalledTimes(1);
  });
  it("should run processor if CLOUD_RUN_ALL_WORKERS_WORKER_NAME worker found", async () => {
    const processorMock = jest.fn().mockResolvedValueOnce("ok");
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
        priority: 0,
        processors: [{ priority: 0, processor: processorMock }] as CloudRunWorkerProcessorMetadata[],
      },
    ] as CloudRunWorkerMetadata[]);
    const date = new Date();
    const encodeData = toBase64({ data: { date, prop: 1 }, name: "name" });

    await expect(
      service.execute({ attributes: { attr: 2 }, data: encodeData, messageId: "1" }),
    ).resolves.toBeUndefined();
    expect(processorMock).toHaveBeenCalledWith(
      { data: { date, prop: 1 }, name: "name" },
      { attributes: { attr: 2 }, data: encodeData, messageId: "1" },
    );
  });

  it("should run processor if CLOUD_RUN_UNHANDLED_WORKER_NAME worker found", async () => {
    const processorMock = jest.fn().mockResolvedValueOnce("ok");
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: CLOUD_RUN_UNHANDLED_WORKER_NAME,
        priority: 0,
        processors: [{ priority: 0, processor: processorMock }] as CloudRunWorkerProcessorMetadata[],
      },
    ] as CloudRunWorkerMetadata[]);
    await expect(
      service.execute({
        attributes: { attr: 2 },
        data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
        messageId: "1",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toBeCalledTimes(1);
  });

  it("priority", async () => {
    const processorMock = jest.fn();
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        priority: 2,
        processors: [
          { priority: 2, processor: () => processorMock(5) },
          { priority: 1, processor: () => processorMock(4) },
          { priority: 3, processor: () => processorMock(6) },
        ] as CloudRunWorkerProcessorMetadata[],
      },
      {
        name: "name",
        priority: 1,
        processors: [
          { priority: 2, processor: () => processorMock(2) },
          { priority: 1, processor: () => processorMock(1) },
          { priority: 3, processor: () => processorMock(3) },
        ] as CloudRunWorkerProcessorMetadata[],
      },
      {
        name: CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
        priority: 1,
        processors: [
          { priority: 2, processor: () => processorMock(8) },
          { priority: 1, processor: () => processorMock(7) },
          { priority: 3, processor: () => processorMock(9) },
        ] as CloudRunWorkerProcessorMetadata[],
      },
    ] as CloudRunWorkerMetadata[]);

    await expect(
      service.execute({
        attributes: { attr: 2 },
        data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
        messageId: "1",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toBeCalledTimes(9);
    expect(processorMock).nthCalledWith(1, 1);
    expect(processorMock).nthCalledWith(2, 2);
    expect(processorMock).nthCalledWith(3, 3);
    expect(processorMock).nthCalledWith(4, 4);
    expect(processorMock).nthCalledWith(5, 5);
    expect(processorMock).nthCalledWith(6, 6);
    expect(processorMock).nthCalledWith(7, 7);
    expect(processorMock).nthCalledWith(8, 8);
    expect(processorMock).nthCalledWith(9, 9);
  });

  it("maxRetryAttempts", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunWorkerModule.registerAsync({ useFactory: () => ({ maxRetryAttempts: 3 } as any) })],
    }).compile();
    service = app.get<CloudRunWorkerService>(CloudRunWorkerService);
    explorerService = app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService);

    const mock = jest.fn().mockImplementation((): void => {
      throw new Error();
    });
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        processors: [{ priority: 0, processor: mock }] as CloudRunWorkerProcessorMetadata[],
      },
    ] as CloudRunWorkerMetadata[]);
    await expect(
      service.execute({ attributes: { attr: 2 }, data: toBase64({ data: { prop: 1 }, name: "name" }), messageId: "1" }),
    ).resolves.toBeUndefined();
    expect(mock).toBeCalledTimes(3);
  });
});

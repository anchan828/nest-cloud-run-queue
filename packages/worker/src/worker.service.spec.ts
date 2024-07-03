import { Message } from "@anchan828/nest-cloud-run-queue-common";
import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  ALL_WORKERS_QUEUE_WORKER_NAME,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_QUEUE_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
  UNHANDLED_QUEUE_WORKER_NAME,
} from "./constants";
import { QueueWorkerExplorerService } from "./explorer.service";
import {
  QueueWorkerMetadata,
  QueueWorkerProcessor,
  QueueWorkerProcessorMetadata,
  QueueWorkerRawMessage,
} from "./interfaces";
import { QueueWorkerModule } from "./worker.module";
import { QueueWorkerService } from "./worker.service";

function toBase64(json: object | string): string {
  if (typeof json === "object") {
    json = JSON.stringify(json);
  }

  return Buffer.from(json).toString("base64");
}

describe("QueueWorkerService", () => {
  let service: QueueWorkerService;
  let explorerService: QueueWorkerExplorerService;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [QueueWorkerModule.register({ throwModuleError: true })],
    }).compile();
    service = app.get<QueueWorkerService>(QueueWorkerService);
    explorerService = app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(explorerService).toBeDefined();
  });

  describe("pubsub style", () => {
    it("should throw error if data is not message object", async () => {
      await expect(
        service.execute({ data: toBase64("testtest"), messageId: "1" } as QueueWorkerRawMessage),
      ).rejects.toThrowError(new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT));
    });

    it("should throw error if data invalid", async () => {
      await expect(service.execute({ data: "invalid" } as QueueWorkerRawMessage)).rejects.toThrowError(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if data is null", async () => {
      await expect(service.execute({ data: null } as QueueWorkerRawMessage)).rejects.toThrowError(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if message dosen't have name", async () => {
      await expect(
        service.execute({ data: toBase64({ data: "data" } as Message), messageId: "1" }),
      ).rejects.toThrowError(new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND));
    });

    it("should throw error if worker not found", async () => {
      await expect(
        service.execute({ data: toBase64({ name: "name" } as Message), messageId: "1" }),
      ).rejects.toThrowError(new BadRequestException(ERROR_WORKER_NOT_FOUND("name")));
    });

    it("should run processor if worker found (data is base64)", async () => {
      const processor: QueueWorkerProcessor = (message: any, raw: any) => {
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
      ] as QueueWorkerMetadata[]);
      await expect(
        service.execute({
          attributes: { attr: 2 },
          data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
          messageId: "1",
        }),
      ).resolves.toBeUndefined();
      expect(processorMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("tasks/http style", () => {
    it("should throw error if message is empty", async () => {
      await expect(service.execute({} as QueueWorkerRawMessage)).rejects.toThrowError(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if data is not message object", async () => {
      await expect(service.execute({ test: "test" } as QueueWorkerRawMessage)).rejects.toThrowError(
        ERROR_QUEUE_WORKER_NAME_NOT_FOUND,
      );
    });

    it("should throw error if message name is null", async () => {
      await expect(service.execute({ name: null } as QueueWorkerRawMessage)).rejects.toThrowError(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if worker not found", async () => {
      await expect(service.execute({ name: "name" })).rejects.toThrowError(
        new BadRequestException(ERROR_WORKER_NOT_FOUND("name")),
      );
    });

    it("should run processor if worker found", async () => {
      const processor: QueueWorkerProcessor = (message: any, raw: any) => {
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
      ] as QueueWorkerMetadata[]);
      await expect(
        service.execute({
          attributes: { attr: 2 },
          data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
          messageId: "1",
        }),
      ).resolves.toBeUndefined();
      expect(processorMock).toHaveBeenCalledTimes(1);
    });
  });

  it("should run processor if ALL_WORKERS_QUEUE_WORKER_NAME worker found", async () => {
    const processorMock = jest.fn().mockResolvedValueOnce("ok");
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: ALL_WORKERS_QUEUE_WORKER_NAME,
        priority: 0,
        processors: [{ priority: 0, processor: processorMock }] as QueueWorkerProcessorMetadata[],
      },
    ] as QueueWorkerMetadata[]);
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

  it("should run processor if UNHANDLED_QUEUE_WORKER_NAME worker found", async () => {
    const processorMock = jest.fn().mockResolvedValueOnce("ok");
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: UNHANDLED_QUEUE_WORKER_NAME,
        priority: 0,
        processors: [{ priority: 0, processor: processorMock }] as QueueWorkerProcessorMetadata[],
      },
    ] as QueueWorkerMetadata[]);
    await expect(
      service.execute({
        attributes: { attr: 2 },
        data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
        messageId: "1",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toHaveBeenCalledTimes(1);
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
        ] as QueueWorkerProcessorMetadata[],
      },
      {
        name: "name",
        priority: 1,
        processors: [
          { priority: 2, processor: () => processorMock(2) },
          { priority: 1, processor: () => processorMock(1) },
          { priority: 3, processor: () => processorMock(3) },
        ] as QueueWorkerProcessorMetadata[],
      },
      {
        name: ALL_WORKERS_QUEUE_WORKER_NAME,
        priority: 1,
        processors: [
          { priority: 2, processor: () => processorMock(8) },
          { priority: 1, processor: () => processorMock(7) },
          { priority: 3, processor: () => processorMock(9) },
        ] as QueueWorkerProcessorMetadata[],
      },
    ] as QueueWorkerMetadata[]);

    await expect(
      service.execute({
        attributes: { attr: 2 },
        data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
        messageId: "1",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toHaveBeenCalledTimes(9);
    expect(processorMock).toHaveBeenNthCalledWith(1, 1);
    expect(processorMock).toHaveBeenNthCalledWith(2, 2);
    expect(processorMock).toHaveBeenNthCalledWith(3, 3);
    expect(processorMock).toHaveBeenNthCalledWith(4, 4);
    expect(processorMock).toHaveBeenNthCalledWith(5, 5);
    expect(processorMock).toHaveBeenNthCalledWith(6, 6);
    expect(processorMock).toHaveBeenNthCalledWith(7, 7);
    expect(processorMock).toHaveBeenNthCalledWith(8, 8);
    expect(processorMock).toHaveBeenNthCalledWith(9, 9);
  });

  it("maxRetryAttempts", async () => {
    const app = await Test.createTestingModule({
      imports: [QueueWorkerModule.registerAsync({ useFactory: () => ({ maxRetryAttempts: 3 }) as any })],
    }).compile();
    service = app.get<QueueWorkerService>(QueueWorkerService);
    explorerService = app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService);

    const mock = jest.fn().mockImplementation((): void => {
      throw new Error();
    });
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        processors: [{ priority: 0, processor: mock }] as QueueWorkerProcessorMetadata[],
      },
    ] as QueueWorkerMetadata[]);
    await expect(
      service.execute({ attributes: { attr: 2 }, data: toBase64({ data: { prop: 1 }, name: "name" }), messageId: "1" }),
    ).resolves.toBeUndefined();
    expect(mock).toHaveBeenCalledTimes(3);
  });

  it("assuming manual invocation", async () => {
    const processorMock = jest.fn().mockReturnThis();

    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        priority: 0,
        processors: [{ priority: 0, processor: processorMock } as QueueWorkerProcessorMetadata],
      },
    ] as QueueWorkerMetadata[]);
    await expect(
      service.execute({
        data: { prop: 1 },
        name: "name",
      }),
    ).resolves.toBeUndefined();
    expect(processorMock).toHaveBeenCalledWith({ prop: 1 }, { data: { prop: 1 }, name: "name" });
  });
});

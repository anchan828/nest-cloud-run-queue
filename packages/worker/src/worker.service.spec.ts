import { Message } from "@anchan828/nest-cloud-run-queue-common";
import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ERROR_INVALID_MESSAGE_FORMAT, ERROR_QUEUE_WORKER_NAME_NOT_FOUND, ERROR_WORKER_NOT_FOUND } from "./constants";
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
      ).rejects.toThrow(new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT));
    });

    it("should throw error if data invalid", async () => {
      await expect(service.execute({ data: "invalid" } as QueueWorkerRawMessage)).rejects.toThrow(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if data is null", async () => {
      await expect(service.execute({ data: null } as QueueWorkerRawMessage)).rejects.toThrow(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if message dosen't have name", async () => {
      await expect(service.execute({ data: toBase64({ data: "data" } as Message), messageId: "1" })).rejects.toThrow(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if worker not found", async () => {
      await expect(service.execute({ data: toBase64({ name: "name" } as Message), messageId: "1" })).rejects.toThrow(
        new BadRequestException(ERROR_WORKER_NOT_FOUND("name")),
      );
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
          className: "className",
          name: "name",
          priority: 0,
          processors: [
            { priority: 0, processor, processorName: "className.processorName", workerName: "name" },
            { priority: 1, processor: processorMock, processorName: "className.processorName2", workerName: "name" },
          ],
        },
      ] as QueueWorkerMetadata[]);
      await expect(
        service.execute({
          attributes: { attr: 2 },
          data: toBase64({ data: { date: new Date("2024-07-08"), prop: 1 }, name: "name" }),
          messageId: "1",
        }),
      ).resolves.toEqual([
        {
          data: {
            date: new Date("2024-07-08"),
            prop: 1,
          },
          processorName: "className.processorName",
          raw: {
            attributes: {
              attr: 2,
            },
            data: "eyJkYXRhIjp7ImRhdGUiOiIyMDI0LTA3LTA4VDAwOjAwOjAwLjAwMFoiLCJwcm9wIjoxfSwibmFtZSI6Im5hbWUifQ==",
            messageId: "1",
          },
          success: true,
          workerName: "name",
        },
        {
          data: {
            date: new Date("2024-07-08"),
            prop: 1,
          },
          error: expect.any(Error),
          processorName: "className.processorName2",
          raw: {
            attributes: {
              attr: 2,
            },
            data: "eyJkYXRhIjp7ImRhdGUiOiIyMDI0LTA3LTA4VDAwOjAwOjAwLjAwMFoiLCJwcm9wIjoxfSwibmFtZSI6Im5hbWUifQ==",
            messageId: "1",
          },
          success: false,
          workerName: "name",
        },
      ]);
      expect(processorMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("tasks/http style", () => {
    it("should throw error if message is empty", async () => {
      await expect(service.execute({} as QueueWorkerRawMessage)).rejects.toThrow(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if data is not message object", async () => {
      await expect(service.execute({ test: "test" } as QueueWorkerRawMessage)).rejects.toThrow(
        ERROR_QUEUE_WORKER_NAME_NOT_FOUND,
      );
    });

    it("should throw error if message name is null", async () => {
      await expect(service.execute({ name: null } as QueueWorkerRawMessage)).rejects.toThrow(
        new BadRequestException(ERROR_QUEUE_WORKER_NAME_NOT_FOUND),
      );
    });

    it("should throw error if worker not found", async () => {
      await expect(service.execute({ name: "name" })).rejects.toThrow(
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
            { priority: 0, processor, processorName: "processor", workerName: "worker" },
            { priority: 1, processor: processorMock, processorName: "processor", workerName: "worker" },
          ],
        },
      ] as QueueWorkerMetadata[]);
      await expect(
        service.execute({
          attributes: { attr: 2 },
          data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
          messageId: "1",
        }),
      ).resolves.toHaveLength(2);
      expect(processorMock).toHaveBeenCalledTimes(1);
    });
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
        processors: [
          { priority: 0, processor: mock, processorName: "processor", workerName: "worker" },
        ] as QueueWorkerProcessorMetadata[],
      },
    ] as QueueWorkerMetadata[]);
    await expect(
      service.execute({ attributes: { attr: 2 }, data: toBase64({ data: { prop: 1 }, name: "name" }), messageId: "1" }),
    ).resolves.toEqual([
      {
        data: { prop: 1 },
        error: expect.any(Error),
        processorName: "processor",
        raw: { attributes: { attr: 2 }, data: "eyJkYXRhIjp7InByb3AiOjF9LCJuYW1lIjoibmFtZSJ9", messageId: "1" },
        success: false,
        workerName: "worker",
      },
    ]);
    expect(mock).toHaveBeenCalledTimes(3);
  });

  it("assuming manual invocation", async () => {
    const processorMock = jest.fn().mockReturnThis();

    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        priority: 0,
        processors: [
          {
            priority: 0,
            processor: processorMock,
            processorName: "processor",
            workerName: "worker",
          } as QueueWorkerProcessorMetadata,
        ],
      },
    ] as QueueWorkerMetadata[]);
    await expect(
      service.execute({
        data: { prop: 1 },
        name: "name",
      }),
    ).resolves.toHaveLength(1);
    expect(processorMock).toHaveBeenCalledWith({ prop: 1 }, { data: { prop: 1 }, name: "name" });
  });

  describe("getWorkers", () => {
    it("should get empty array (invalid message)", async () => {
      expect(service.getWorkers({})).toEqual([]);
    });

    it("should get workers", async () => {
      const processorMock = jest.fn().mockReturnThis();

      jest.spyOn(explorerService, "explore").mockReturnValueOnce([
        {
          name: "name",
          priority: 0,
          processors: [
            {
              priority: 0,
              processor: processorMock,
              processorName: "processor",
              workerName: "name",
            } as QueueWorkerProcessorMetadata,
          ],
        },
      ] as QueueWorkerMetadata[]);

      expect(service.getWorkers({ data: { prop: 1 }, name: "name" })).toEqual([
        {
          message: {
            data: { data: { prop: 1 }, name: "name" },
            raw: { data: { prop: 1 }, name: "name" },
          },
          metadata: {
            name: "name",
            priority: 0,
            processors: [
              {
                priority: 0,
                processor: processorMock,
                processorName: "processor",
                workerName: "name",
              },
            ],
          },
          options: { throwModuleError: true },
        },
      ]);
    });
  });
});

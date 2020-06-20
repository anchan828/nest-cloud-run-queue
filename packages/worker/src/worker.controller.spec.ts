import { CloudRunPubSubMessage } from "@anchan828/nest-cloud-run-pubsub-common";
import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
  CLOUD_RUN_UNHANDLED_WORKER_NAME,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
} from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import { CloudRunPubSubWorkerMetadata, CloudRunPubSubWorkerProcessor } from "./interfaces";
import { PubSubRootDto } from "./message.dto";
import { CloudRunPubSubWorkerController } from "./worker.controller";
import { CloudRunPubSubWorkerModule } from "./worker.module";

function toBase64(json: object | string): string {
  if (typeof json === "object") {
    json = JSON.stringify(json);
  }

  return Buffer.from(json).toString("base64");
}

describe("CloudRunPubSubWorkerController", () => {
  let controller: CloudRunPubSubWorkerController;
  let explorerService: CloudRunPubSubWorkerExplorerService;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubWorkerModule.register({ throwModuleError: true })],
    }).compile();
    controller = app.get<CloudRunPubSubWorkerController>(CloudRunPubSubWorkerController);
    explorerService = app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(explorerService).toBeDefined();
  });
  it("should ignore error if data invalid", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubWorkerModule.registerAsync({ useFactory: () => ({} as any) })],
    }).compile();
    controller = app.get<CloudRunPubSubWorkerController>(CloudRunPubSubWorkerController);
    explorerService = app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService);
    await expect(
      controller.root({ message: { data: "invalid" }, subscription: "123" } as PubSubRootDto),
    ).resolves.toBeUndefined();
  });
  it("should throw error if data invalid", async () => {
    await expect(
      controller.root({ message: { data: "invalid" }, subscription: "123" } as PubSubRootDto),
    ).rejects.toThrowError(new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT));
  });

  it("should throw error if data is not message object", async () => {
    await expect(
      controller.root({ message: { data: toBase64("testtest") }, subscription: "123" } as PubSubRootDto),
    ).rejects.toThrowError(new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT));
  });

  it("should throw error if message dosen't have name", async () => {
    await expect(
      controller.root({
        message: { data: toBase64({ data: "data" } as CloudRunPubSubMessage) },
        subscription: "123",
      } as PubSubRootDto),
    ).rejects.toThrowError(new BadRequestException(ERROR_WORKER_NAME_NOT_FOUND));
  });

  it("should throw error if worker not found", async () => {
    await expect(
      controller.root({
        message: { data: toBase64({ name: "name" } as CloudRunPubSubMessage) },
        subscription: "123",
      } as PubSubRootDto),
    ).rejects.toThrowError(new BadRequestException(ERROR_WORKER_NOT_FOUND("name")));
  });

  it("should run processor if worker found", async () => {
    const processor: CloudRunPubSubWorkerProcessor = (
      message: any,
      attributes: Record<string, any>,
      info: PubSubRootDto,
    ) => {
      expect(message).toEqual({ date: expect.any(Date), prop: 1 });
      expect(attributes).toEqual({ attr: 2 });
      expect(info).toEqual({
        message: {
          attributes: { attr: 2 },
          data: expect.any(String),
          messageId: "1234",
          publishTime: "934074354430499",
        },
        subscription: "123",
      });
    };
    const processorMock = jest.fn().mockImplementation((): void => {
      throw new Error();
    });
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        processors: [processor, processorMock],
      },
    ] as CloudRunPubSubWorkerMetadata[]);
    await expect(
      controller.root({
        message: {
          attributes: { attr: 2 },
          data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
          messageId: "1234",
          publishTime: "934074354430499",
        },
        subscription: "123",
      } as PubSubRootDto),
    ).resolves.toBeUndefined();
    expect(processorMock).toBeCalledTimes(1);
  });

  it("should run processor if CLOUD_RUN_ALL_WORKERS_WORKER_NAME worker found", async () => {
    const processorMock = jest.fn().mockResolvedValueOnce("ok");
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
        processors: [processorMock] as CloudRunPubSubWorkerProcessor[],
      },
    ] as CloudRunPubSubWorkerMetadata[]);
    const date = new Date();
    const encodeData = toBase64({ data: { date, prop: 1 }, name: "name" });

    await expect(
      controller.root({
        message: {
          attributes: { attr: 2 },
          data: encodeData,
          messageId: "1234",
          publishTime: "934074354430499",
        },
        subscription: "123",
      } as PubSubRootDto),
    ).resolves.toBeUndefined();
    expect(processorMock).toHaveBeenCalledWith(
      { data: { date, prop: 1 }, name: "name" },
      { attr: 2 },
      {
        message: {
          attributes: { attr: 2 },
          data: encodeData,
          messageId: "1234",
          publishTime: "934074354430499",
        },
        subscription: "123",
      },
    );
  });

  it("should run processor if CLOUD_RUN_UNHANDLED_WORKER_NAME worker found", async () => {
    const processorMock = jest.fn().mockResolvedValueOnce("ok");
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: CLOUD_RUN_UNHANDLED_WORKER_NAME,
        processors: [processorMock] as CloudRunPubSubWorkerProcessor[],
      },
    ] as CloudRunPubSubWorkerMetadata[]);
    await expect(
      controller.root({
        message: {
          attributes: { attr: 2 },
          data: toBase64({ data: { date: new Date(), prop: 1 }, name: "name" }),
          messageId: "1234",
          publishTime: "934074354430499",
        },
        subscription: "123",
      } as PubSubRootDto),
    ).resolves.toBeUndefined();
    expect(processorMock).toBeCalledTimes(1);
  });

  it("maxRetryAttempts", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubWorkerModule.registerAsync({ useFactory: () => ({ maxRetryAttempts: 3 } as any) })],
    }).compile();
    controller = app.get<CloudRunPubSubWorkerController>(CloudRunPubSubWorkerController);
    explorerService = app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService);

    const mock = jest.fn().mockImplementation((): void => {
      throw new Error();
    });
    jest.spyOn(explorerService, "explore").mockReturnValueOnce([
      {
        name: "name",
        processors: [mock] as any,
      },
    ] as CloudRunPubSubWorkerMetadata[]);
    await expect(
      controller.root({
        message: {
          attributes: { attr: 2 },
          data: toBase64({ data: { prop: 1 }, name: "name" }),
          messageId: "1234",
          publishTime: "934074354430499",
        },
        subscription: "123",
      } as PubSubRootDto),
    ).resolves.toBeUndefined();
    expect(mock).toBeCalledTimes(3);
  });
});

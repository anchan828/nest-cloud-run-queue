import { Test } from "@nestjs/testing";
import { PubSubReceivedMessageDto } from "./message.dto";
import { CloudRunPubSubWorkerController } from "./worker.controller";
import { CloudRunPubSubWorkerModule } from "./worker.module";
import { CloudRunPubSubWorkerService } from "./worker.service";

describe("CloudRunPubSubWorkerController", () => {
  let controller: CloudRunPubSubWorkerController;
  let service: CloudRunPubSubWorkerService;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubWorkerModule.register({ throwModuleError: true })],
    }).compile();
    controller = app.get(CloudRunPubSubWorkerController);
    service = app.get(CloudRunPubSubWorkerService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should call execute method", async () => {
    jest.spyOn(service, "execute").mockResolvedValueOnce();
    await expect(
      controller.root({
        message: { data: "invalid", messageId: "2" },
        subscription: "123",
      } as PubSubReceivedMessageDto),
    ).resolves.toBeUndefined();
  });
});

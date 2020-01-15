import { Test } from "@nestjs/testing";
import { CloudRunPubSubWorker, CloudRunPubSubWorkerProcess } from "./decorators";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import { CloudRunPubSubWorkerModule } from "./worker.module";
describe("CloudRunPubSubWorkerExplorerService", () => {
  it("should get empty workers", async () => {
    const app = await Test.createTestingModule({ imports: [CloudRunPubSubWorkerModule.register()] }).compile();
    const explorer = app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([]);
  });

  it("should get worker", async () => {
    @CloudRunPubSubWorker("TestWorker")
    class TestWorker {}

    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([
      {
        instance: expect.any(TestWorker),
        name: "TestWorker",
        processors: [],
      },
    ]);
  });

  it("should get worker and processor", async () => {
    @CloudRunPubSubWorker("TestWorker")
    class TestWorker {
      @CloudRunPubSubWorkerProcess()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async process(): Promise<void> {}

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async noProcess(): Promise<void> {}
    }

    const app = await Test.createTestingModule({
      imports: [CloudRunPubSubWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<CloudRunPubSubWorkerExplorerService>(CloudRunPubSubWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([
      {
        instance: expect.any(TestWorker),
        name: "TestWorker",
        processors: [expect.anything()],
      },
    ]);
  });
});

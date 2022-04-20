import { Test } from "@nestjs/testing";
import { CloudRunQueueWorker, CloudRunQueueWorkerProcess } from "./decorators";
import { CloudRunQueueWorkerExplorerService } from "./explorer.service";
import { CloudRunQueueWorkerModule } from "./worker.module";
describe("CloudRunQueueWorkerExplorerService", () => {
  it("should get empty workers", async () => {
    const app = await Test.createTestingModule({ imports: [CloudRunQueueWorkerModule.register()] }).compile();
    const explorer = app.get<CloudRunQueueWorkerExplorerService>(CloudRunQueueWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([]);
  });

  it("should get worker", async () => {
    @CloudRunQueueWorker("TestWorker")
    class TestWorker {}

    const app = await Test.createTestingModule({
      imports: [CloudRunQueueWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<CloudRunQueueWorkerExplorerService>(CloudRunQueueWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([
      {
        instance: expect.any(TestWorker),
        name: "TestWorker",
        priority: 0,
        processors: [],
      },
    ]);
  });

  it("should get worker and processor", async () => {
    @CloudRunQueueWorker("TestWorker")
    class TestWorker {
      @CloudRunQueueWorkerProcess()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async process(): Promise<void> {}

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async noProcess(): Promise<void> {}
    }

    const app = await Test.createTestingModule({
      imports: [CloudRunQueueWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<CloudRunQueueWorkerExplorerService>(CloudRunQueueWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([
      {
        instance: expect.any(TestWorker),
        name: "TestWorker",
        priority: 0,
        processors: [expect.anything()],
      },
    ]);
  });
});

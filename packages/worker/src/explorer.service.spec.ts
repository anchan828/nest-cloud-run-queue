import { Test } from "@nestjs/testing";
import { QueueWorker, QueueWorkerProcess } from "./decorators";
import { QueueWorkerExplorerService } from "./explorer.service";
import { QueueWorkerModule } from "./worker.module";
describe("QueueWorkerExplorerService", () => {
  it("should get empty workers", async () => {
    const app = await Test.createTestingModule({ imports: [QueueWorkerModule.register()] }).compile();
    const explorer = app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([]);
  });

  it("should get worker", async () => {
    @QueueWorker("TestWorker")
    class TestWorker {}

    const app = await Test.createTestingModule({
      imports: [QueueWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService);
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
    @QueueWorker("TestWorker")
    class TestWorker {
      @QueueWorkerProcess()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async process(): Promise<void> {}

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async noProcess(): Promise<void> {}
    }

    const app = await Test.createTestingModule({
      imports: [QueueWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<QueueWorkerExplorerService>(QueueWorkerExplorerService);
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

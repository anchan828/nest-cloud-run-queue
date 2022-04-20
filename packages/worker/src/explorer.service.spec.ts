import { Test } from "@nestjs/testing";
import { CloudRunWorker, CloudRunWorkerProcess } from "./decorators";
import { CloudRunWorkerExplorerService } from "./explorer.service";
import { CloudRunWorkerModule } from "./worker.module";
describe("CloudRunWorkerExplorerService", () => {
  it("should get empty workers", async () => {
    const app = await Test.createTestingModule({ imports: [CloudRunWorkerModule.register()] }).compile();
    const explorer = app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService);
    expect(explorer).toBeDefined();
    expect(explorer.explore()).toEqual([]);
  });

  it("should get worker", async () => {
    @CloudRunWorker("TestWorker")
    class TestWorker {}

    const app = await Test.createTestingModule({
      imports: [CloudRunWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService);
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
    @CloudRunWorker("TestWorker")
    class TestWorker {
      @CloudRunWorkerProcess()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async process(): Promise<void> {}

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public async noProcess(): Promise<void> {}
    }

    const app = await Test.createTestingModule({
      imports: [CloudRunWorkerModule.register()],
      providers: [TestWorker],
    }).compile();
    const explorer = app.get<CloudRunWorkerExplorerService>(CloudRunWorkerExplorerService);
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

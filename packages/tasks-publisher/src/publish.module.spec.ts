import { CloudTasksClient } from "@google-cloud/tasks";
import { Test } from "@nestjs/testing";
import { CLOUD_RUN_TASKS_CLIENT, CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { CloudRunQueueTasksPublisherModuleOptions } from "./interfaces";
import { CloudRunQueueTasksPublisherModule } from "./publish.module";
import { CloudRunQueueTasksPublisherService } from "./publish.service";

describe("CloudRunQueueTasksPublisherModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunQueueTasksPublisherModule.register()],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunQueueTasksPublisherService>(CloudRunQueueTasksPublisherService)).toBeDefined();
    expect(app.get<CloudTasksClient>(CLOUD_RUN_TASKS_CLIENT)).toBeDefined();
    expect(app.get<CloudRunQueueTasksPublisherModuleOptions>(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunQueueTasksPublisherModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunQueueTasksPublisherService>(CloudRunQueueTasksPublisherService)).toBeDefined();
    expect(app.get<CloudTasksClient>(CLOUD_RUN_TASKS_CLIENT)).toBeDefined();
    expect(app.get<CloudRunQueueTasksPublisherModuleOptions>(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });
});

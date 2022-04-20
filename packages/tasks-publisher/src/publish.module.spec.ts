import { CloudTasksClient } from "@google-cloud/tasks";
import { Test } from "@nestjs/testing";
import { TASKS_CLIENT, TASKS_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { TasksPublisherModuleOptions } from "./interfaces";
import { TasksPublisherModule } from "./publish.module";
import { TasksPublisherService } from "./publish.service";

describe("TasksPublisherModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [TasksPublisherModule.register()],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<TasksPublisherService>(TasksPublisherService)).toBeDefined();
    expect(app.get<CloudTasksClient>(TASKS_CLIENT)).toBeDefined();
    expect(app.get<TasksPublisherModuleOptions>(TASKS_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        TasksPublisherModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<TasksPublisherService>(TasksPublisherService)).toBeDefined();
    expect(app.get<CloudTasksClient>(TASKS_CLIENT)).toBeDefined();
    expect(app.get<TasksPublisherModuleOptions>(TASKS_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });
});

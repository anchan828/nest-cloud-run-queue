import { CloudTasksClient } from "@google-cloud/tasks";
import { Test } from "@nestjs/testing";
import { CLOUD_RUN_TASKS_CLIENT, CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { CloudRunTasksPublisherModuleOptions } from "./interfaces";
import { CloudRunTasksPublisherModule } from "./publish.module";
import { CloudRunTasksPublisherService } from "./publish.service";

describe("CloudRunTasksPublisherModule", () => {
  it("should compile with register", async () => {
    const app = await Test.createTestingModule({
      imports: [CloudRunTasksPublisherModule.register()],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunTasksPublisherService>(CloudRunTasksPublisherService)).toBeDefined();
    expect(app.get<CloudTasksClient>(CLOUD_RUN_TASKS_CLIENT)).toBeDefined();
    expect(app.get<CloudRunTasksPublisherModuleOptions>(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });

  it("should compile with registerAsync", async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunTasksPublisherModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
    }).compile();
    expect(app).toBeDefined();

    expect(app.get<CloudRunTasksPublisherService>(CloudRunTasksPublisherService)).toBeDefined();
    expect(app.get<CloudTasksClient>(CLOUD_RUN_TASKS_CLIENT)).toBeDefined();
    expect(app.get<CloudRunTasksPublisherModuleOptions>(CLOUD_RUN_TASKS_PUBLISHER_MODULE_OPTIONS)).toBeDefined();
  });
});

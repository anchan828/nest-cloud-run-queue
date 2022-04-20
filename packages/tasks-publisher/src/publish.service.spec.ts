import { Test } from "@nestjs/testing";
import { CloudRunQueueTasksPublisherModule } from "./publish.module";
import { CloudRunQueueTasksPublisherService } from "./publish.service";
import { credentials } from "@grpc/grpc-js";
import { CloudTasksClient } from "@google-cloud/tasks";
import { CLOUD_RUN_TASKS_CLIENT } from "./constants";
describe("CloudRunQueueTasksPublisherService", () => {
  let service: CloudRunQueueTasksPublisherService;
  let client: CloudTasksClient;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunQueueTasksPublisherModule.register({
          clientConfig: { apiEndpoint: "localhost", port: 8123, sslCreds: credentials.createInsecure() },
          publishConfig: {
            httpRequest: { headers: { "X-DefaultHeader": "test" }, url: "http://localhost:3000" },
          },
          queue: "projects/projectId/locations/location/queues/nest-cloud-run-queue-tasks-publisher",
        }),
      ],
    }).compile();
    service = app.get(CloudRunQueueTasksPublisherService);
    client = app.get<CloudTasksClient>(CLOUD_RUN_TASKS_CLIENT);
  });

  describe("publish", () => {
    beforeEach(() => {
      jest.spyOn(client, "createTask").mockImplementation(async () => {
        return [
          { name: "projects/projectId/locations/location/queues/nest-cloud-run-queue-tasks-publisher/tasks/task-name" },
        ];
      });
    });

    it("should create task (add header)", async () => {
      await expect(
        service.publish({ data: { test: "ok" }, name: "test" }, { httpRequest: { headers: { "X-Header": "test" } } }),
      ).resolves.toEqual(
        "projects/projectId/locations/location/queues/nest-cloud-run-queue-tasks-publisher/tasks/task-name",
      );

      expect(client.createTask).toBeCalledWith({
        parent: "projects/projectId/locations/location/queues/nest-cloud-run-queue-tasks-publisher",
        task: {
          httpRequest: {
            body: "eyJtZXNzYWdlIjp7ImRhdGEiOnsiZGF0YSI6eyJ0ZXN0Ijoib2sifSwibmFtZSI6InRlc3QifX19",
            headers: {
              "X-DefaultHeader": "test",
              "X-Header": "test",
              "content-type": "application/json",
            },
            httpMethod: "POST",
            url: "http://localhost:3000",
          },
        },
      });
    });
  });
});

import { Test } from "@nestjs/testing";
import { CloudRunTasksPublisherModule } from "./publish.module";
import { CloudRunTasksPublisherService } from "./publish.service";
import { credentials } from "@grpc/grpc-js";
import { CloudTasksClient } from "@google-cloud/tasks";
import { CLOUD_RUN_TASKS_CLIENT } from "./constants";
describe("CloudRunTasksPublisherService", () => {
  let service: CloudRunTasksPublisherService;
  let client: CloudTasksClient;
  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [
        CloudRunTasksPublisherModule.register({
          clientConfig: { apiEndpoint: "localhost", port: 8123, sslCreds: credentials.createInsecure() },
          publishConfig: {
            httpRequest: { headers: { "X-DefaultHeader": "test" }, url: "http://localhost:3000" },
          },
          queue: "projects/projectId/locations/location/queues/nest-cloud-run-queue-tasks-publisher",
        }),
      ],
    }).compile();
    service = app.get(CloudRunTasksPublisherService);
    client = app.get<CloudTasksClient>(CLOUD_RUN_TASKS_CLIENT);
  });

  describe("publish (use mock)", () => {
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
            },
            httpMethod: "POST",
            url: "http://localhost:3000",
          },
        },
      });
    });
  });

  describe("publish (use emulator)", () => {
    it("should get task name", async () => {
      await expect(service.publish({ data: { test: "ok" }, name: "test" })).resolves.toEqual(
        expect.stringContaining(
          "projects/projectId/locations/location/queues/nest-cloud-run-queue-tasks-publisher/tasks/",
        ),
      );
    });
  });
});

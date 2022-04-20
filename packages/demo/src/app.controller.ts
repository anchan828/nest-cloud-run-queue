import { CloudRunQueuePubSubPublisherService } from "@anchan828/nest-cloud-run-queue-pubsub-publisher";
import { CloudRunQueueTasksPublisherService } from "@anchan828/nest-cloud-run-queue-tasks-publisher";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  constructor(
    private readonly pubsubService: CloudRunQueuePubSubPublisherService,
    private readonly tasksService: CloudRunQueueTasksPublisherService,
  ) {}

  @Get()
  public hello(): string {
    return "hello";
  }

  @Get("/pubsub")
  public async publishPubsubMessage(): Promise<string> {
    return this.pubsubService.publish({ data: "message", name: "pubsub" });
  }

  @Get("/tasks")
  public async publishTasksMessage(): Promise<string> {
    return this.tasksService.publish({ data: "message", name: "tasks" });
  }
}

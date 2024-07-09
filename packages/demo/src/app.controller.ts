import { PubSubPublisherService } from "@anchan828/nest-cloud-run-queue-pubsub-publisher";
import { TasksPublisherService } from "@anchan828/nest-cloud-run-queue-tasks-publisher";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  constructor(
    private readonly pubsubService: PubSubPublisherService,
    private readonly tasksService: TasksPublisherService,
  ) {}

  @Get()
  public hello(): string {
    const port = process.env.PORT || 3000;
    return [
      "Demo link:",
      `<div><a href="http://localhost:${port}/pubsub">http://localhost:${port}/pubsub</a></div>`,
      `<div><a href="http://localhost:${port}/tasks">http://localhost:${port}/tasks</a></div>`,
    ].join("\n\n");
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

# Demo

This is demo package.

## Run demo site with docker compose

```bash
$ docker compose up
```

## Check operations

### Access http://localhost:3000/pubsub

```ts
@Controller()
export class AppController {
  constructor(private readonly pubsubService: PubSubPublisherService) {}

  @Get("/pubsub")
  public async publishPubsubMessage(): Promise<string> {
    return this.pubsubService.publish({ data: "message", name: "pubsub" });
  }
}
```

```ts
@QueueWorker("pubsub")
export class PubSubWorker {
  @QueueWorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("pubsub", message, raw);
  }
}
```

<img width="823" alt="9e29b5c3b998e6b78bcd2b8a15a3f4c9" src="https://user-images.githubusercontent.com/694454/164208898-86e81a94-cfad-42b5-8952-9ffaf1191dc2.png">

### Access http://localhost:3000/tasks

```ts
@Controller()
export class AppController {
  constructor(private readonly tasksService: TasksPublisherService) {}

  @Get("/tasks")
  public async publishTasksMessage(): Promise<string> {
    return this.tasksService.publish({ data: "message", name: "tasks" });
  }
}
```

```ts
@QueueWorker("tasks")
export class TasksWorker {
  @QueueWorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("tasks", message, raw);
  }
}
```

<img width="777" alt="813283a6a247ce98d987abe836deda04" src="https://user-images.githubusercontent.com/694454/164208835-074e1c03-df94-410e-b144-121d745b4bdd.png">

# @anchan828/nest-cloud-run-queue

Create a Queue/Worker for [NestJS](https://nestjs.com/) application in Cloud Run.

![nest-cloud-run-queue](https://user-images.githubusercontent.com/694454/164212037-6afd1e3a-ab0f-4f61-b607-469826d04ffb.png)

## Overview

I am wondering how to implement Queue when running an application with Cloud Run. While @nestjs/bull is a very good library, Cloud Run, which is serverless, cannot be used because the server is not always running. You can use "CPU always allocated" for resolve this issue, but it doesn't make sense to use Cloud Run.

Therefore, I used Cloud Pub/Sub or Cloud Tasks so that I could implement Queue via HTTP requests. This package supports both, so you can choose whichever you prefer.

[Choose Cloud Tasks or Pub/Sub](https://cloud.google.com/tasks/docs/comp-pub-sub)

Of course, these packages can work without using Cloud Run on workers since they handle tasks via HTTP requests.

## Demo

See [https://github.com/anchan828/nest-cloud-run-queue/tree/master/packages/demo](https://github.com/anchan828/nest-cloud-run-queue/tree/master/packages/demo#readme)

This demo uses an emulator, which runs PubSub and Tasks locally. Please see [docker-compose.yml](https://github.com/anchan828/nest-cloud-run-queue/blob/master/docker-compose.yml) if you are interested.

## Packages

There are two types of packages.

### Publisher

| Package                                                                                                                            | Description                                       |
| :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| [@anchan828/nest-cloud-run-queue-pubsub-publisher](https://www.npmjs.com/package/@anchan828/nest-cloud-run-queue-pubsub-publisher) | Library for sending messages using Cloud Pub/Sub. |
| [@anchan828/nest-cloud-run-queue-tasks-publisher](https://www.npmjs.com/package/@anchan828/nest-cloud-run-queue-tasks-publisher)   | Library for sending messages using Cloud Tasks.   |

### Worker

| Package                                                                                                        | Description                                                          |
| :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| [@anchan828/nest-cloud-run-queue-worker](https://www.npmjs.com/package/@anchan828/nest-cloud-run-queue-worker) | Library for creating applications that receive and process messages. |

## Getting started

## 1. Create publisher application

### Using Cloud Pub/Sub

See: [@anchan828/nest-cloud-run-queue-pubsub-publisher - README.md](https://github.com/anchan828/nest-cloud-run-queue/tree/master/packages/pubsub-publisher#readme)

### Using Cloud Tasks

See: [@anchan828/nest-cloud-run-queue-tasks-publisher - README.md](https://github.com/anchan828/nest-cloud-run-queue/tree/master/packages/tasks-publisher#readme)

## 2. Create worker application

#### Import worker module

```ts
@Module({
  imports: [QueueWorkerModule.register()],
})
export class WorkerAppModule {}
```

#### Create worker provider

```ts
@QueueWorker("Worker name")
// @QueueWorker({ name: "Worker name" })
class Worker {
  @QueueWorkerProcess()
  public async process(message: string | object, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("Message:", message);
    console.log("Raw message:", raw);
  }
}
```

### Add as provider

```ts
@Module({
  imports: [QueueWorkerModule.register()],
  providers: [Worker],
})
export class WorkerAppModule {}
```

### Customize worker controller

The Controller who receives the message is automatically defined. You can customize it.

```ts
@Module({
  imports: [
    QueueWorkerModule.register({
      workerController: {
        method: RequestMethod.GET,
        path: "/worker",
      },

      // Default
      // workerController: {
      //   method: RequestMethod.POST,
      //   path: "/",
      // },
    }),
  ],
  providers: [Worker],
})
export class WorkerAppModule {}
```

You can also define your own Controller. In that case, set workerController to null.

```ts
@Controller("/worker")
class WorkerController {
  constructor(private readonly service: QueueWorkerService) {}

  @Post()
  public async execute(@Body() body: QueueWorkerReceivedMessage): Promise<void> {
    await this.service.execute(body.message);

    // or

    // const decodedMessage = decodeMessage(body.message);
    // await this.service.execute(decodedMessage);
  }
}

@Module({
  controllers: [WorkerController],
  imports: [
    QueueWorkerModule.register({
      workerController: null,
    }),
  ],
  providers: [Worker],
})
export class WorkerAppModule {}
```

### Create bootstrap function

```ts
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WorkerAppModule);
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
```

## Using Cloud Scheduler

You can use Cloud Scheduler as trigger.

Payload is JSON string `{"name": "worker name", "data": "str"}`

![](https://i.gyazo.com/a778c6a67eed6e525c38dd42378aa8bf.png)

## Using as standalone

There may be times when you want to use it for a one-time call, such as Cloud Run jobs.

```ts
import { QueueWorkerService } from "@anchan828/nest-cloud-run-queue-worker";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerAppModule);
  await app.get(QueueWorkerService).execute({
    name: "worker name",
    data: "str",
  });
}

bootstrap();
```

## Global Events

This package is defined special event handlers.

Note: `throwModuleError: true` is not working if you set global events.

### UNHANDLED_QUEUE_WORKER

You can listen to undefined worker name

```typescript
@QueueWorker(UNHANDLED_QUEUE_WORKER)
class Worker {
  @QueueWorkerProcess()
  public async process(message: Message<any>, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("Message:", message);
    console.log("Raw message:", raw);
  }
}
```

### ALL_QUEUE_WORKERS

You can listen to all workers

```typescript
@QueueWorker(ALL_QUEUE_WORKERS)
class Worker {
  @QueueWorkerProcess()
  public async process(message: Message<any>, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("Message:", message);
    console.log("Raw message:", raw);
  }
}
```

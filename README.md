# @anchan828/nest-cloud-run-queue

[![Maintainability](https://api.codeclimate.com/v1/badges/3df1d40de6d47f4768ae/maintainability)](https://codeclimate.com/github/anchan828/nest-cloud-run-queue-pubsub/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3df1d40de6d47f4768ae/test_coverage)](https://codeclimate.com/github/anchan828/nest-cloud-run-queue-pubsub/test_coverage)

Create a Queue/Worker for [NestJS](https://nestjs.com/) application in Cloud Run.

![nest-cloud-run-queue](https://user-images.githubusercontent.com/694454/164212037-6afd1e3a-ab0f-4f61-b607-469826d04ffb.png)

## Overview

I am wondering how to implement Queue when running an application with Cloud Run. While @nestjs/bull is a very good library, Cloud Run, which is serverless, cannot be used because the server is not always running. You can use "CPU always allocated" for resolve this issue, but it doesn't make sense to use Cloud Run.

Therefore, I used Cloud Pub/Sub or Cloud Tasks so that I could implement Queue via HTTP requests. This package supports both, so you can choose whichever you prefer.

[Choose Cloud Tasks or Pub/Sub](https://cloud.google.com/tasks/docs/comp-pub-sub)

## Demo

See [https://github.com/anchan828/nest-cloud-run-queue/tree/master/packages/demo](https://github.com/anchan828/nest-cloud-run-queue/tree/master/packages/demo#readme)


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

NOTE: You may want to do tutorial for using Pub/Sub with Cloud Run before using them.
https://cloud.google.com/run/docs/tutorials/pubsub

#### Import publisher module

```ts
@Module({
  imports: [
    PubSubPublisherModule.register({
      topic: "myRunTopic",
      clientConfig: {
        // If necessary
        projectId: "projectId",
        keyFilename: "path/to/file.json",
      },
    }),
  ],
})
export class PublisherAppModule {}
```

#### Publish message to topic

```ts
export class Service {
  constructor(private readonly pubsubService: PubSubPublisherService) {}

  public async sendMessage(): Promise<void> {
    await this.pubsubService.publish({
      // Required. this property is used by @anchan828/nest-cloud-run-queue-worker
      name: "Worker name",
      // string or object. ex, { text: "text" }
      data: "text",
    });
  }
}
```

### Using Cloud Tasks

NOTE: You may want to do tutorial for using Tasks with Cloud Run before using them.
https://cloud.google.com/run/docs/triggering/using-tasks

#### Import publisher module

```ts
@Module({
  imports: [
    TasksPublisherModule.register({
      clientConfig: {
        // If necessary
        projectId: "projectId",
        keyFilename: "path/to/file.json",
      },
      publishConfig: {
        httpRequest: {
          // By setting this as the default URL here, you can save yourself the trouble of setting the URL each time.
          url: "https://example-this-is-demo-uc.a.run.app",
        },
      },
      queue: "projects/test/locations/location/queues/nest-cloud-run-queue-demo",
    }),
  ],
})
export class PublisherAppModule {}
```

#### Publish message to queue

```ts
export class Service {
  constructor(private readonly pubsubService: PubSubPublisherService) {}

  public async sendMessage(): Promise<void> {
    await this.pubsubService.publish({
      // Required. this property is used by @anchan828/nest-cloud-run-queue-worker
      name: "Worker name",
      // string or object. ex, { text: "text" }
      data: "text",
    });
  }
}
```

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
class Worker {
  @QueueWorkerProcess()
  public async process(message: string | object, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("Message: " + JSON.stringify(message));
    console.log("Attributes: " + JSON.stringify(attributes));
    console.log("request.body: " + JSON.stringify(raw));
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

### Create bootstrap function

```ts
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WorkerAppModule);
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
```

## Testing

You can create mock for PUBSUB when you are using pubsub publisher

```typescript
Test.createTestingModule(metadata)
  .overrideProvider(PUBSUB)
  .useValue({
    topic: jest.fn().mockImplementation(() => ({
      publishJSON: jest.fn().mockResolvedValue("published"),
    })),
  })
  .compile();
```

You can create mock for TASKS_CLIENT when you are using tasks publisher

```typescript
Test.createTestingModule(metadata)
  .overrideProvider(TASKS_CLIENT)
  .useValue({
    createTask: jest.fn().mockImplementation(() => [{ name: "task name" }]),
  })
  .compile();
```

## Using Cloud Scheduler

You can use Cloud Scheduler as trigger.

Payload is JSON string `{"name": "worker name", "data": "str"}`

![](https://i.gyazo.com/a778c6a67eed6e525c38dd42378aa8bf.png)

## Global Events

This package is defined special event handlers.

Note: `throwModuleError: true` is not working if you set global events.

### UNHANDLED_QUEUE_WORKER

You can listen to undefined worker name

```typescript
@QueueWorker(UNHANDLED_QUEUE_WORKER)
class Worker {
  @QueueWorkerProcess()
  public async process(message: Message<any>, attributes: Record<string, any>, raw: any): Promise<void> {
    console.log("Message: " + JSON.stringify(message));
    console.log("Attributes: " + JSON.stringify(attributes));
    console.log("request.body: " + JSON.stringify(raw));
  }
}
```

### ALL_QUEUE_WORKERS

You can listen to all workers

```typescript
@QueueWorker(ALL_QUEUE_WORKERS)
class Worker {
  @QueueWorkerProcess()nest-cloud-run-queue-worker
  public async process(message: Message<any>, attributes: Record<string, any>, raw: any): Promise<void> {
    console.log("Message: " + JSON.stringify(message));
    console.log("Attributes: " + JSON.stringify(attributes));
    console.log("request.body: " + JSON.stringify(raw));
  }
}
```

### Pull subscription

You can use woeker with pull subscription.

You need to inject QueueWorkerService and call execute method.

```typescript
import { QueueWorkerService } from "@anchan828/nest-cloud-run-queue-worker";
import { Message, PubSub, v1 } from "@google-cloud/pubsub";
import { Logger } from "@nestjs/common";

export class PullSubscriptionWorker {
  constructor(private readonly workerService: QueueWorkerService) {}

  /**
   * See: https://cloud.google.com/pubsub/docs/pull#asynchronous-pull
   */
  public async setUpAsynchronousPull() {
    const pubSubClient = new PubSub({ projectId: "test" });
    const subscription = pubSubClient.topic("nest-cloud-run-queue-pubsub-demo").subscription("pull-subscription");

    subscription.on("message", async (message: Message) => {
      await this.workerService.execute(message);
      message.ack();
      Logger.log(`Done: ${message.id}`, "Async Pull Subscription");
    });
  }

  /**
   * See: https://cloud.google.com/pubsub/docs/pull#synchronous_pull
   */
  public async setUpSynchronousPull() {
    const subClient = new v1.SubscriberClient();
    const formattedSubscription = subClient.subscriptionPath("test", "pull-subscription");
    const request = {
      maxMessages: 10,
      subscription: formattedSubscription,
    };

    const [response] = await subClient.pull(request);

    const ackIds: string[] = [];
    for (const message of response.receivedMessages || []) {
      if (!message.message) {
        continue;
      }

      await this.workerService.execute(message.message);
      if (message.ackId) {
        ackIds.push(message.ackId);
      }
    }

    const ackRequest = {
      ackIds: ackIds,
      subscription: formattedSubscription,
    };

    await subClient.acknowledge(ackRequest);

    Logger.log(`Done: ${ackIds.join(", ")}`, "Pull Subscription");
  }
}
```

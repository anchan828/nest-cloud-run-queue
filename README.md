# @anchan828/nest-cloud-run-pubsub

[![Maintainability](https://api.codeclimate.com/v1/badges/3df1d40de6d47f4768ae/maintainability)](https://codeclimate.com/github/anchan828/nest-cloud-run-pubsub/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3df1d40de6d47f4768ae/test_coverage)](https://codeclimate.com/github/anchan828/nest-cloud-run-pubsub/test_coverage)

Using Pub/Sub and Nest framework with Cloud Run.

## Overview

Create two applications using these packages.

| Package                                    | Description                                                                |
| :----------------------------------------- | :------------------------------------------------------------------------- |
| @anchan828/nest-cloud-run-pubsub-publisher | This is used by application of sending a Pub/Sub message to the topic.     |
| @anchan828/nest-cloud-run-pubsub-worker    | This is used by application of receiving a Pub/Sub message from the topic. |

## Getting started

NOTE: You may want to do tutorial for using Pub/Sub with Cloud Run before using this packages.
https://cloud.google.com/run/docs/tutorials/pubsub

### 1. Create topic

You need to create topic.

```sh
$ gcloud pubsub topics create myRunTopic
```

### 2. Create publisher application

#### Import publisher module

```ts
@Module({
  imports: [
    CloudRunPubSubPublisherModule.register({
      topic: "myRunTopic",
      // If necessary
      keyFilename: "path/to/file.json",
    }),
  ],
})
export class PublisherAppModule {}
```

#### Send Pub/Sub message to topic

```ts
export class Service {
  constructor(private readonly pubsubService: CloudRunPubSubService) {}

  public async sendMessage(): Promise<void> {
    await this.pubsubService.publish({
      // Required. this property is used by @anchan828/nest-cloud-run-pubsub-worker
      name: "Worker name",
      // string or object. ex, { text: "text" }
      data: "text",
    });
  }
}
```

### 3. Create worker application

#### Import worker module

```ts
@Module({
  imports: [CloudRunPubSubWorkerModule.register()],
})
export class WorkerAppModule {}
```

#### Create worker provider

```ts
@CloudRunPubSubWorker("Worker name")
class Worker {
  @CloudRunPubSubWorkerProcess()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async process(message: string | object, attributes: Record<string, any>, raw: PubSubRootDto): Promise<void> {
    console.log("Message: " + JSON.stringify(message));
    console.log("Attributes: " + JSON.stringify(attributes));
    console.log("request.body: " + JSON.stringify(raw));
  }
}
```

### Add as provider

```ts
@Module({
  imports: [CloudRunPubSubWorkerModule.register()],
  providers: [Worker],
})
export class WorkerAppModule {}
```

### Create bootstrap function

```ts
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WorkerAppModule, {
    bodyParser: true,
  });
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
```

### 5. Deploy docker image and create service on Cloud Run

1. Build worker application
2. Build docker image
3. Deploy docker image to Google Container Registry
4. Create service on Cloud Run

Then you can get service url

![](https://i.gyazo.com/26a5ba90ed55466db3e21127e64d1289.png)

### 4. Create subscription (push) for topic

`SERVICE-URL` with the HTTPS URL provided on deploying the service.
(ex, https://nest-cloud-run-pubsub-xxxxxxxxxxx-an.a.run.app)

```
gcloud pubsub subscriptions create myRunSubscription \
    --topic myRunTopic \
    --push-endpoint=SERVICE-URL
```

If you want to test on your locally:

1. Run pubsub emulator. And set `localhost:{PORT}` of emulator to PUBSUB_EMULATOR_HOST
2. Run test server for receiving a Pub/Sub message from the topic. And set `localhost:${PORT}` of test server to `SERVICE-URL`

See [docker-compose.yml](https://github.com/anchan828/nest-cloud-run-pubsub/blob/master/docker-compose.yml) and [jest.setup.js](https://github.com/anchan828/nest-cloud-run-pubsub/blob/master/jest.setup.js)

### 5. Done

Your service is now fully integrated with Pub/Sub using Nest framework!

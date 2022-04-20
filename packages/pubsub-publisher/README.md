# @anchan828/nest-cloud-run-queue-pubsub-publisher

## Install

```shell
npm i @anchan828/nest-cloud-run-queue-pubsub-publisher
```

## Usage

NOTE: You may want to do tutorial for using Pub/Sub with Cloud Run before using them.
https://cloud.google.com/run/docs/tutorials/pubsub

### Import publisher module

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

### Publish message to topic

```ts
export class Service {
  constructor(private readonly pubsubService: PubSubPublisherService) {}

  public async publishMessage(): Promise<void> {
    await this.pubsubService.publish({
      // Required. this property is used by @anchan828/nest-cloud-run-queue-worker
      name: "Worker name",
      // string or object. ex, { text: "text" }
      data: "text",
    });
  }
}
```

See more information: [https://github.com/anchan828/nest-cloud-run-queue#readme](https://github.com/anchan828/nest-cloud-run-queue#readme)

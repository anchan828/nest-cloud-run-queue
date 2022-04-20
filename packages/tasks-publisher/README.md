# @anchan828/nest-cloud-run-queue-tasks-publisher

## Install

```shell
npm i @anchan828/nest-cloud-run-queue-tasks-publisher
```

## Usage

NOTE: You may want to do tutorial for using Tasks with Cloud Run before using them.
https://cloud.google.com/run/docs/triggering/using-tasks

### Import publisher module

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

### Publish message to queue

```ts
export class Service {
  constructor(private readonly tasksService: TasksPublisherService) {}

  public async sendMessage(): Promise<void> {
    await this.tasksService.publish({
      // Required. this property is used by @anchan828/nest-cloud-run-queue-worker
      name: "Worker name",
      // string or object. ex, { text: "text" }
      data: "text",
    });
  }
}
```

See more information: [https://github.com/anchan828/nest-cloud-run-queue#readme](https://github.com/anchan828/nest-cloud-run-queue#readme)

import { Inject, Module, OnModuleInit } from "@nestjs/common";
import { CloudRunWorkerModule } from "@anchan828/nest-cloud-run-queue-worker";
import {
  CloudRunPubSubPublisherModule,
  CloudRunPubSubPublisherModuleOptions,
  CLOUD_RUN_PUBSUB,
  CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS,
} from "@anchan828/nest-cloud-run-queue-pubsub-publisher";
import { CloudRunTasksPublisherModule } from "@anchan828/nest-cloud-run-queue-tasks-publisher";
import { PubSub } from "@google-cloud/pubsub";
import { PubSubWorker, TasksWorker } from "./processor";
import { AppController } from "./app.controller";
import { credentials } from "@grpc/grpc-js";

@Module({
  controllers: [AppController],
  imports: [
    CloudRunWorkerModule.register(),
    CloudRunPubSubPublisherModule.register({
      clientConfig: { projectId: "test" },
      topic: "nest-cloud-run-queue-demo",
    }),
    CloudRunTasksPublisherModule.register({
      clientConfig: {
        apiEndpoint: "gcloud-tasks-emulator",
        port: 8123,
        projectId: "test",
        sslCreds: credentials.createInsecure(),
      },
      publishConfig: {
        httpRequest: {
          url: process.env.CLOUD_RUN_WORKER_ENDPOINT,
        },
      },
      queue: "projects/test/locations/location/queues/nest-cloud-run-queue-demo",
    }),
  ],
  providers: [PubSubWorker, TasksWorker],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(CLOUD_RUN_PUBSUB_PUBLISHER_MODULE_OPTIONS) private readonly options: CloudRunPubSubPublisherModuleOptions,
    @Inject(CLOUD_RUN_PUBSUB) private readonly pubsub: PubSub,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.createPubSubTopicAndSubscription();
  }

  /**
   * Create topic and subscription to emulator for development. This should not be used in production.
   *
   * @private
   * @return {*}  {Promise<void>}
   * @memberof AppModule
   */
  private async createPubSubTopicAndSubscription(): Promise<void> {
    if (!this.options.topic) {
      return;
    }
    const topic = this.pubsub.topic(this.options.topic);

    if (!(await topic.exists())[0]) {
      await topic.create();
    }

    const pushSubscription = topic.subscription("push-subscription");

    if (!(await pushSubscription.exists())[0]) {
      await pushSubscription.create({ pushEndpoint: process.env.CLOUD_RUN_WORKER_ENDPOINT });
    }

    const pullSubscription = topic.subscription("pull-subscription");

    if (!(await pullSubscription.exists())[0]) {
      await pullSubscription.create();
    }
  }
}

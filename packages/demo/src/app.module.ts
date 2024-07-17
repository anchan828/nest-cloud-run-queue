import {
  PUBSUB,
  PUBSUB_PUBLISHER_MODULE_OPTIONS,
  PubSubPublisherModule,
  PubSubPublisherModuleOptions,
} from "@anchan828/nest-cloud-run-queue-pubsub-publisher";
import { TasksPublisherModule } from "@anchan828/nest-cloud-run-queue-tasks-publisher";
import { QueueWorkerModule } from "@anchan828/nest-cloud-run-queue-worker";
import { PubSub } from "@google-cloud/pubsub";
import { credentials } from "@grpc/grpc-js";
import { Inject, Module, OnModuleInit } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PubSubWorker, TasksWorker } from "./processor";

@Module({
  controllers: [AppController],
  imports: [
    QueueWorkerModule.register({
      extraConfig: {
        parseReviver(key, value) {
          if (key === "organizationId") {
            return BigInt(value);
          }
          return value;
        },
      },
    }),
    PubSubPublisherModule.register({
      clientConfig: {},
      extraConfig: {
        stringifyReplacer(key, value) {
          if (key === "organizationId") {
            return value.toString();
          }
          return value;
        },
      },
      topic: "nest-cloud-run-queue-demo",
    }),
    TasksPublisherModule.register({
      clientConfig: {
        apiEndpoint: "gcloud-tasks-emulator",
        port: 8123,
        sslCreds: credentials.createInsecure(),
      },
      extraConfig: {
        stringifyReplacer(key, value) {
          if (key === "organizationId") {
            return value.toString();
          }
          return value;
        },
      },
      publishConfig: {
        httpRequest: {
          url: process.env.WORKER_ENDPOINT,
        },
      },
      queue: "projects/test/locations/location/queues/nest-cloud-run-queue-demo",
    }),
  ],
  providers: [PubSubWorker, TasksWorker],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(PUBSUB_PUBLISHER_MODULE_OPTIONS)
    private readonly options: PubSubPublisherModuleOptions,
    @Inject(PUBSUB) private readonly pubsub: PubSub,
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
      await pushSubscription.create({ pushEndpoint: process.env.WORKER_ENDPOINT });
    }

    const pullSubscription = topic.subscription("pull-subscription");

    if (!(await pullSubscription.exists())[0]) {
      await pullSubscription.create();
    }
  }
}

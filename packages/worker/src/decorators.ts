import { CloudRunPubSubWorkerName } from "@anchan828/nest-cloud-run-pubsub-common";
import { SetMetadata } from "@nestjs/common";
import { CLOUD_RUN_PUBSUB_WORKER_DECORATOR, CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR } from "./constants";
export function CloudRunPubSubWorker(name: CloudRunPubSubWorkerName): ClassDecorator {
  return SetMetadata(CLOUD_RUN_PUBSUB_WORKER_DECORATOR, name) as ClassDecorator;
}

export function CloudRunPubSubWorkerProcess(): MethodDecorator {
  return SetMetadata(CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR, undefined) as MethodDecorator;
}

import { CloudRunWorkerName } from "@anchan828/nest-cloud-run-common";
import { SetMetadata } from "@nestjs/common";
import { CLOUD_RUN_PUBSUB_WORKER_DECORATOR, CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR } from "./constants";

/**
 * Define worker
 *
 * @export
 * @param {CloudRunWorkerName} name
 * @param {number} [priority=0] Highest priority is 0, and lower the larger integer you use.
 * @returns {ClassDecorator}
 */
export function CloudRunPubSubWorker(name: CloudRunWorkerName, priority = 0): ClassDecorator {
  return SetMetadata(CLOUD_RUN_PUBSUB_WORKER_DECORATOR, { name, priority }) as ClassDecorator;
}

/**
 * Define worker processor
 *
 * @export
 * @param {number} [priority=0] Highest priority is 0, and lower the larger integer you use.
 * @returns {MethodDecorator}
 */
export function CloudRunPubSubWorkerProcess(priority = 0): MethodDecorator {
  return SetMetadata(CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR, { priority }) as MethodDecorator;
}

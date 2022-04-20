import { QueueWorkerName } from "@anchan828/nest-cloud-run-common";
import { SetMetadata } from "@nestjs/common";
import { QUEUE_WORKER_DECORATOR, QUEUE_WORKER_PROCESS_DECORATOR } from "./constants";

/**
 * Define worker
 *
 * @export
 * @param {QueueWorkerName} name
 * @param {number} [priority=0] Highest priority is 0, and lower the larger integer you use.
 * @returns {ClassDecorator}
 */
export function QueueWorker(name: QueueWorkerName, priority = 0): ClassDecorator {
  return SetMetadata(QUEUE_WORKER_DECORATOR, { name, priority }) as ClassDecorator;
}

/**
 * Define worker processor
 *
 * @export
 * @param {number} [priority=0] Highest priority is 0, and lower the larger integer you use.
 * @returns {MethodDecorator}
 */
export function QueueWorkerProcess(priority = 0): MethodDecorator {
  return SetMetadata(QUEUE_WORKER_PROCESS_DECORATOR, { priority }) as MethodDecorator;
}

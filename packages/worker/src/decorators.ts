import { QueueWorkerName } from "@anchan828/nest-cloud-run-queue-common";
import { SetMetadata } from "@nestjs/common";
import { QUEUE_WORKER_DECORATOR, QUEUE_WORKER_PROCESS_DECORATOR } from "./constants";
import { QueueWorkerDecoratorArgs, QueueWorkerOptions, QueueWorkerProcessOptions } from "./interfaces";

/**
 * Define worker
 *
 * @export
 * @param {QueueWorkerName} name
 * @param {number} [priority=0] Highest priority is 0, and lower the larger integer you use.
 * @returns {ClassDecorator}
 */
export function QueueWorker(name: QueueWorkerName, priority?: number): ClassDecorator;
export function QueueWorker(names: QueueWorkerName[], priority?: number): ClassDecorator;
export function QueueWorker(options: QueueWorkerOptions): ClassDecorator;
export function QueueWorker(
  nameOrOptions: QueueWorkerName | QueueWorkerName[] | QueueWorkerOptions,
  priority = 0,
): ClassDecorator {
  if (Array.isArray(nameOrOptions)) {
    return SetMetadata(QUEUE_WORKER_DECORATOR, {
      names: nameOrOptions,
      priority,
    } as QueueWorkerDecoratorArgs);
  }

  if (typeof nameOrOptions === "string") {
    return SetMetadata(QUEUE_WORKER_DECORATOR, {
      names: [nameOrOptions],
      priority,
    } as QueueWorkerDecoratorArgs);
  }

  return SetMetadata(QUEUE_WORKER_DECORATOR, {
    enabled: nameOrOptions.enabled,
    names: Array.isArray(nameOrOptions.name) ? nameOrOptions.name : [nameOrOptions.name],
    priority: nameOrOptions.priority || 0,
  } as QueueWorkerDecoratorArgs);
}

/**
 * Define worker processor
 *
 * @export
 * @param {number} [priority=0] Highest priority is 0, and lower the larger integer you use.
 * @returns {MethodDecorator}
 */
export function QueueWorkerProcess(priority?: number): MethodDecorator;
export function QueueWorkerProcess(options?: QueueWorkerProcessOptions): MethodDecorator;
export function QueueWorkerProcess(priorityOrOptions?: number | QueueWorkerProcessOptions): MethodDecorator {
  const options =
    typeof priorityOrOptions === "number"
      ? { priority: priorityOrOptions }
      : Object.assign({ priority: 0 }, priorityOrOptions);

  return SetMetadata(QUEUE_WORKER_PROCESS_DECORATOR, options) as MethodDecorator;
}

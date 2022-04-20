import {
  CloudRunQueueWorker,
  CloudRunQueueWorkerRawMessage,
  CloudRunQueueWorkerProcess,
} from "@anchan828/nest-cloud-run-queue-worker";

@CloudRunQueueWorker("pubsub")
export class PubSubWorker {
  @CloudRunQueueWorkerProcess()
  public async process(message: string, raw: CloudRunQueueWorkerRawMessage): Promise<void> {
    console.log("pubsub", message, raw);
  }
}

@CloudRunQueueWorker("tasks")
export class TasksWorker {
  @CloudRunQueueWorkerProcess()
  public async process(message: string, raw: CloudRunQueueWorkerRawMessage): Promise<void> {
    console.log("tasks", message, raw);
  }
}

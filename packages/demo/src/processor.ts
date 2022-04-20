import { QueueWorker, QueueWorkerRawMessage, QueueWorkerProcess } from "@anchan828/nest-cloud-run-queue-worker";

@QueueWorker("pubsub")
export class PubSubWorker {
  @QueueWorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("pubsub", message, raw);
  }
}

@QueueWorker("tasks")
export class TasksWorker {
  @QueueWorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("tasks", message, raw);
  }
}

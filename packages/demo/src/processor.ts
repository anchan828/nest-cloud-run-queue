import { QueueWorker, QueueWorkerProcess, QueueWorkerRawMessage } from "@anchan828/nest-cloud-run-queue-worker";

@QueueWorker({ name: "pubsub" })
export class PubSubWorker {
  @QueueWorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("pubsub", message, raw);
  }
}

@QueueWorker({ name: "tasks" })
export class TasksWorker {
  @QueueWorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("tasks", message, raw);
  }
}

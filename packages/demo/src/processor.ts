import { Worker, QueueWorkerRawMessage, WorkerProcess } from "@anchan828/nest-cloud-run-queue-worker";

@Worker("pubsub")
export class PubSubWorker {
  @WorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("pubsub", message, raw);
  }
}

@Worker("tasks")
export class TasksWorker {
  @WorkerProcess()
  public async process(message: string, raw: QueueWorkerRawMessage): Promise<void> {
    console.log("tasks", message, raw);
  }
}

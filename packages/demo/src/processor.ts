import {
  CloudRunWorker,
  CloudRunWorkerRawMessage,
  CloudRunWorkerProcess,
} from "@anchan828/nest-cloud-run-queue-worker";

@CloudRunWorker("pubsub")
export class PubSubWorker {
  @CloudRunWorkerProcess()
  public async process(message: string, raw: CloudRunWorkerRawMessage): Promise<void> {
    console.log("pubsub", message, raw);
  }
}

@CloudRunWorker("tasks")
export class TasksWorker {
  @CloudRunWorkerProcess()
  public async process(message: string, raw: CloudRunWorkerRawMessage): Promise<void> {
    console.log("tasks", message, raw);
  }
}

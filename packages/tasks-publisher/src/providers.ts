import { CloudTasksClient } from "@google-cloud/tasks";
import { CloudRunQueueTasksPublisherModuleOptions } from "./interfaces";

export function createClient(options: CloudRunQueueTasksPublisherModuleOptions): CloudTasksClient {
  return new CloudTasksClient(options.clientConfig);
}

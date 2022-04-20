import { CloudTasksClient } from "@google-cloud/tasks";
import { TasksPublisherModuleOptions } from "./interfaces";

export function createClient(options: TasksPublisherModuleOptions): CloudTasksClient {
  return new CloudTasksClient(options.clientConfig);
}

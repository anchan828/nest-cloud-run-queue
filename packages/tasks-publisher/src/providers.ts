import { CloudTasksClient } from "@google-cloud/tasks";
import { CloudRunTasksPublisherModuleOptions } from "./interfaces";

export function createClient(options: CloudRunTasksPublisherModuleOptions): CloudTasksClient {
  return new CloudTasksClient(options.clientConfig);
}

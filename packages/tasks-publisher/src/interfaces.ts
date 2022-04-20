import {
  CloudRunQueueMessage,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
  PublishExtraConfig,
} from "@anchan828/nest-cloud-run-common";
import type { google } from "@google-cloud/tasks/build/protos/protos";
import { ClientOptions, CallOptions } from "google-gax";
export interface CloudRunQueueTasksPublisherModuleOptions extends ModuleOptions {
  // default topic
  queue?: string;
  clientConfig?: ClientOptions;
  publishConfig?: PublishConfig;
  extraConfig?: PublishExtraConfig;
}
export type CloudRunQueueTasksPublisherModuleAsyncOptions =
  ModuleAsyncOptions<CloudRunQueueTasksPublisherModuleOptions>;

export type CloudRunQueueTasksPublisherModuleOptionsFactory =
  ModuleOptionsFactory<CloudRunQueueTasksPublisherModuleOptions>;

export type PublishConfig = Omit<google.cloud.tasks.v2.ITask, "name">;

export type PublishOptions = {
  queue?: string;
  gaxOpts?: CallOptions;
} & PublishConfig;

export type PublishData<T> = CloudRunQueueMessage<T>;

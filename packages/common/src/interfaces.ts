import { Type } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common/interfaces";
export type ModuleOptions = {};
export interface ModuleAsyncOptions<T extends ModuleOptions = ModuleOptions> extends Pick<ModuleMetadata, "imports"> {
  useClass?: Type<ModuleOptionsFactory<T>>;
  useExisting?: Type<ModuleOptionsFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: Array<Type<ModuleOptionsFactory<T>> | string | any>;
}

export interface ModuleOptionsFactory<T extends ModuleOptions = ModuleOptions> {
  createModuleOptions(): Promise<T> | T;
}

export type CloudRunWorkerName = string;
export interface CloudRunQueueMessage<T = any> {
  name: CloudRunWorkerName;
  data?: T;
}

export type PublishExtraConfig<T extends CloudRunQueueMessage = CloudRunQueueMessage> = {
  // Run BEFORE the message is published
  prePublish?: (message: T) => T | Promise<T>;
  // Run AFTER the message is published
  postPublish?: (message: T, messageId: string) => void | Promise<void>;
};

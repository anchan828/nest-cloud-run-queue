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

export type CloudRunPubSubWorkerName = string;
export type CloudRunPubSubMessageData<T> = T;
export interface CloudRunPubSubMessage<T extends object | string = object | string> {
  name: CloudRunPubSubWorkerName;
  data?: CloudRunPubSubMessageData<T>;
}

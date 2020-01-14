import {
  CloudRunPubSubWorkerName,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
} from "@anchan828/nest-cloud-run-pubsub-common";
import { Injectable } from "@nestjs/common/interfaces";
import { PubSubRootDto } from "./message.dto";

export type CloudRunPubSubWorkerModuleOptions = ModuleOptions;
export type CloudRunPubSubWorkerModuleAsyncOptions = ModuleAsyncOptions<CloudRunPubSubWorkerModuleOptions>;
export type CloudRunPubSubWorkerModuleOptionsFactory = ModuleOptionsFactory<CloudRunPubSubWorkerModuleOptions>;

export type CloudRunPubSubWorkerProcessor = <T, U = Record<string, any>>(
  message: T,
  attributes: U,
  info: PubSubRootDto,
) => Promise<void> | void;

export interface CloudRunPubSubWorkerMetadata {
  instance: Injectable;
  name: CloudRunPubSubWorkerName;

  processors: CloudRunPubSubWorkerProcessor[];
}

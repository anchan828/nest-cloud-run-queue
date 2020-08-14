import {
  CloudRunPubSubWorkerName,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
} from "@anchan828/nest-cloud-run-pubsub-common";
import { Injectable } from "@nestjs/common/interfaces";
import { PubSubRootDto } from "./message.dto";

export interface CloudRunPubSubWorkerModuleOptions extends ModuleOptions {
  /**
   * Whether to return 4xx codes when throw error about nest-cloud-run-pubsub module. Default is false.
   * ex, Returns 204 instead of 400 when worker name not found. Returns 204 instead of 400 when message data is invalid.
   * @type {boolean}
   * @memberof CloudRunPubSubWorkerModuleOptions
   */
  throwModuleError?: boolean;

  /**
   * Max number of processor retry attempts. If an error occurs in a processor, it will try again.
   *
   * @type {number}
   * @memberof CloudRunPubSubWorkerModuleOptions
   */
  maxRetryAttempts?: number;

  /**
   * extra config
   *
   * @type {WorkerExtraConfig}
   * @memberof CloudRunPubSubWorkerModuleOptions
   */
  extraConfig?: WorkerExtraConfig;
}
export type CloudRunPubSubWorkerModuleAsyncOptions = ModuleAsyncOptions<CloudRunPubSubWorkerModuleOptions>;
export type CloudRunPubSubWorkerModuleOptionsFactory = ModuleOptionsFactory<CloudRunPubSubWorkerModuleOptions>;

export type CloudRunPubSubWorkerProcessor = <T, U = Record<string, string>>(
  message: T,
  attributes: U,
  info: PubSubRootDto,
) => Promise<void> | void;

export interface CloudRunPubSubWorkerMetadata {
  instance: Injectable;
  name: CloudRunPubSubWorkerName;

  processors: CloudRunPubSubWorkerProcessor[];
}

export type WorkerExtraConfig = {
  // Run BEFORE the message is processed
  preProcessor?: (...args: Parameters<CloudRunPubSubWorkerProcessor>) => void | Promise<void>;
  // Run AFTER the message is processed
  postProcessor?: (...args: Parameters<CloudRunPubSubWorkerProcessor>) => void | Promise<void>;
};

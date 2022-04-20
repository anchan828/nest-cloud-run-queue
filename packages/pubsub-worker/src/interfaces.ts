import {
  CloudRunWorkerName,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
} from "@anchan828/nest-cloud-run-common";
import { Injectable } from "@nestjs/common/interfaces";
import { CloudRunPubSubWorkerPubSubMessage } from "./message.dto";

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
  rawMessage: CloudRunPubSubWorkerPubSubMessage,
) => Promise<void> | void;

export interface CloudRunPubSubWorkerMetadata extends CloudRunPubSubWorkerDecoratorArgs {
  instance: Injectable;

  processors: CloudRunPubSubWorkerProcessorMetadata[];
}

export interface CloudRunPubSubWorkerProcessorMetadata extends CloudRunPubSubWorkerProcessDecoratorArgs {
  processor: CloudRunPubSubWorkerProcessor;
}

export enum CloudRunPubSubWorkerProcessorStatus {
  IN_PROGRESS = 0,
  SKIP = 1,
}

export type WorkerExtraConfig = {
  // Run BEFORE the message is processed
  preProcessor?: (
    name: string,
    ...args: Parameters<CloudRunPubSubWorkerProcessor>
  ) =>
    | (CloudRunPubSubWorkerProcessorStatus | undefined | void)
    | Promise<CloudRunPubSubWorkerProcessorStatus | undefined | void>;
  // Run AFTER the message is processed
  postProcessor?: (name: string, ...args: Parameters<CloudRunPubSubWorkerProcessor>) => void | Promise<void>;
};

export interface CloudRunPubSubWorkerDecoratorArgs {
  name: CloudRunWorkerName;

  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof CloudRunPubSubWorkerDecoratorArgs
   */
  priority: number;
}

export interface CloudRunPubSubWorkerProcessDecoratorArgs {
  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof CloudRunPubSubWorkerProcessDecoratorArgs
   */
  priority: number;
}

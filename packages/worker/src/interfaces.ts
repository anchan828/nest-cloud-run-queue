import {
  CloudRunQueueWorkerName,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
} from "@anchan828/nest-cloud-run-common";
import { RequestMappingMetadata } from "@nestjs/common";
import { Injectable } from "@nestjs/common/interfaces";

export interface CloudRunQueueWorkerModuleOptions extends ModuleOptions {
  /**
   * Whether to return 4xx codes when throw error about nest-cloud-run-queue-pubsub module. Default is false.
   * ex, Returns 204 instead of 400 when worker name not found. Returns 204 instead of 400 when message data is invalid.
   * @type {boolean}
   * @memberof CloudRunQueueWorkerModuleOptions
   */
  throwModuleError?: boolean;

  /**
   * Max number of processor retry attempts. If an error occurs in a processor, it will try again.
   *
   * @type {number}
   * @memberof CloudRunQueueWorkerModuleOptions
   */
  maxRetryAttempts?: number;

  /**
   * extra config
   *
   * @type {CloudRunQueueWorkerExtraConfig}
   * @memberof CloudRunQueueWorkerModuleOptions
   */
  extraConfig?: CloudRunQueueWorkerExtraConfig;

  /**
   * Define a Route for the controller.
   * Default: POST /
   * @type {CloudRunQueueWorkerControllerMetadata}
   * @memberof CloudRunQueueWorkerModuleOptions
   */
  workerController?: CloudRunQueueWorkerControllerMetadata;
}
export type CloudRunQueueWorkerModuleAsyncOptions = ModuleAsyncOptions<
  Omit<CloudRunQueueWorkerModuleOptions, "workerController">
> &
  Pick<CloudRunQueueWorkerModuleOptions, "workerController">;
export type CloudRunQueueWorkerModuleOptionsFactory = ModuleOptionsFactory<
  Omit<CloudRunQueueWorkerModuleOptions, "workerController">
> &
  Pick<CloudRunQueueWorkerModuleOptions, "workerController">;

export type CloudRunQueueWorkerProcessor = <T>(
  message: T,
  rawMessage: CloudRunQueueWorkerRawMessage,
) => Promise<void> | void;

export interface CloudRunQueueWorkerMetadata extends CloudRunQueueWorkerDecoratorArgs {
  instance: Injectable;

  processors: CloudRunQueueWorkerProcessorMetadata[];
}

export interface CloudRunQueueWorkerProcessorMetadata extends CloudRunQueueWorkerProcessDecoratorArgs {
  processor: CloudRunQueueWorkerProcessor;
}

export enum CloudRunQueueWorkerProcessorStatus {
  IN_PROGRESS = 0,
  SKIP = 1,
}

export type CloudRunQueueWorkerExtraConfig = {
  // Run BEFORE the message is processed
  preProcessor?: (
    name: string,
    ...args: Parameters<CloudRunQueueWorkerProcessor>
  ) =>
    | (CloudRunQueueWorkerProcessorStatus | undefined | void)
    | Promise<CloudRunQueueWorkerProcessorStatus | undefined | void>;
  // Run AFTER the message is processed
  postProcessor?: (name: string, ...args: Parameters<CloudRunQueueWorkerProcessor>) => void | Promise<void>;
};

export interface CloudRunQueueWorkerDecoratorArgs {
  name: CloudRunQueueWorkerName;

  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof CloudRunQueueWorkerDecoratorArgs
   */
  priority: number;
}

export interface CloudRunQueueWorkerProcessDecoratorArgs {
  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof CloudRunQueueWorkerProcessDecoratorArgs
   */
  priority: number;
}

export type CloudRunQueueWorkerRawMessage<T = Record<string, any>> = {
  readonly data?: string | Uint8Array | Buffer | null;
  readonly headers?: Record<string, string>;
} & T;

export type CloudRunReceivedMessage = {
  readonly message: CloudRunQueueWorkerRawMessage;
};

export interface CloudRunQueueWorkerControllerMetadata extends RequestMappingMetadata {
  /**
   * Default: 200
   *
   * @type {number}
   * @memberof CloudRunQueueWorkerControllerMetadata
   */
  statusCode?: number;
}

export interface CloudRunQueueWorkerControllerInterface {
  execute(body: CloudRunReceivedMessage, headers: Record<string, string>): Promise<void>;
}

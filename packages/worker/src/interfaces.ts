import {
  CloudRunWorkerName,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
} from "@anchan828/nest-cloud-run-common";
import { RequestMappingMetadata } from "@nestjs/common";
import { Injectable } from "@nestjs/common/interfaces";

export interface CloudRunWorkerModuleOptions extends ModuleOptions {
  /**
   * Whether to return 4xx codes when throw error about nest-cloud-run-queue-pubsub module. Default is false.
   * ex, Returns 204 instead of 400 when worker name not found. Returns 204 instead of 400 when message data is invalid.
   * @type {boolean}
   * @memberof CloudRunWorkerModuleOptions
   */
  throwModuleError?: boolean;

  /**
   * Max number of processor retry attempts. If an error occurs in a processor, it will try again.
   *
   * @type {number}
   * @memberof CloudRunWorkerModuleOptions
   */
  maxRetryAttempts?: number;

  /**
   * extra config
   *
   * @type {CloudRunWorkerExtraConfig}
   * @memberof CloudRunWorkerModuleOptions
   */
  extraConfig?: CloudRunWorkerExtraConfig;

  /**
   * Define a Route for the controller.
   * Default: POST /
   * @type {CloudRunWorkerControllerMetadata}
   * @memberof CloudRunWorkerModuleOptions
   */
  workerController?: CloudRunWorkerControllerMetadata;
}
export type CloudRunWorkerModuleAsyncOptions = ModuleAsyncOptions<
  Omit<CloudRunWorkerModuleOptions, "workerController">
> &
  Pick<CloudRunWorkerModuleOptions, "workerController">;
export type CloudRunWorkerModuleOptionsFactory = ModuleOptionsFactory<
  Omit<CloudRunWorkerModuleOptions, "workerController">
> &
  Pick<CloudRunWorkerModuleOptions, "workerController">;

export type CloudRunWorkerProcessor = <T>(message: T, rawMessage: CloudRunWorkerRawMessage) => Promise<void> | void;

export interface CloudRunWorkerMetadata extends CloudRunWorkerDecoratorArgs {
  instance: Injectable;

  processors: CloudRunWorkerProcessorMetadata[];
}

export interface CloudRunWorkerProcessorMetadata extends CloudRunWorkerProcessDecoratorArgs {
  processor: CloudRunWorkerProcessor;
}

export enum CloudRunWorkerProcessorStatus {
  IN_PROGRESS = 0,
  SKIP = 1,
}

export type CloudRunWorkerExtraConfig = {
  // Run BEFORE the message is processed
  preProcessor?: (
    name: string,
    ...args: Parameters<CloudRunWorkerProcessor>
  ) => (CloudRunWorkerProcessorStatus | undefined | void) | Promise<CloudRunWorkerProcessorStatus | undefined | void>;
  // Run AFTER the message is processed
  postProcessor?: (name: string, ...args: Parameters<CloudRunWorkerProcessor>) => void | Promise<void>;
};

export interface CloudRunWorkerDecoratorArgs {
  name: CloudRunWorkerName;

  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof CloudRunWorkerDecoratorArgs
   */
  priority: number;
}

export interface CloudRunWorkerProcessDecoratorArgs {
  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof CloudRunWorkerProcessDecoratorArgs
   */
  priority: number;
}

export type CloudRunWorkerRawMessage<T = Record<string, any>> = {
  readonly data?: string | Uint8Array | Buffer | null;
  readonly headers?: Record<string, string>;
} & T;

export type CloudRunReceivedMessage = {
  readonly message: CloudRunWorkerRawMessage;
};

export interface CloudRunWorkerControllerMetadata extends RequestMappingMetadata {
  /**
   * Default: 200
   *
   * @type {number}
   * @memberof CloudRunWorkerControllerMetadata
   */
  statusCode?: number;
}

export interface CloudRunWorkerControllerInterface {
  execute(body: CloudRunReceivedMessage, headers: Record<string, string>): Promise<void>;
}

import {
  QueueWorkerName,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
  Message,
} from "@anchan828/nest-cloud-run-queue-common";
import { RequestMappingMetadata } from "@nestjs/common";
import { Injectable } from "@nestjs/common/interfaces";

export interface QueueWorkerModuleOptions extends ModuleOptions {
  /**
   * Whether to return 4xx codes when throw error about nest-cloud-run-queue-pubsub module. Default is false.
   * ex, Returns 204 instead of 400 when worker name not found. Returns 204 instead of 400 when message data is invalid.
   * @type {boolean}
   * @memberof QueueWorkerModuleOptions
   */
  throwModuleError?: boolean;

  /**
   * Max number of processor retry attempts. If an error occurs in a processor, it will try again.
   *
   * @type {number}
   * @memberof QueueWorkerModuleOptions
   */
  maxRetryAttempts?: number;

  /**
   * extra config
   *
   * @type {QueueWorkerExtraConfig}
   * @memberof QueueWorkerModuleOptions
   */
  extraConfig?: QueueWorkerExtraConfig;

  /**
   * Define a Route for the controller.
   * Default: POST /
   * If you provide your own Controller, set it to null.
   * @type {(QueueWorkerControllerMetadata | null)}
   * @memberof QueueWorkerModuleOptions
   */
  workerController?: QueueWorkerControllerMetadata | null;
}
export type QueueWorkerModuleAsyncOptions = ModuleAsyncOptions<Omit<QueueWorkerModuleOptions, "workerController">> &
  Pick<QueueWorkerModuleOptions, "workerController">;
export type QueueWorkerModuleOptionsFactory = ModuleOptionsFactory<Omit<QueueWorkerModuleOptions, "workerController">> &
  Pick<QueueWorkerModuleOptions, "workerController">;

export type QueueWorkerProcessor = <T>(message: T, raw: QueueWorkerRawMessage) => Promise<void> | void;

export interface QueueWorkerMetadata {
  instance: Injectable;

  processors: QueueWorkerProcessorMetadata[];

  name: QueueWorkerName;

  priority: number;
}

export interface QueueWorkerProcessorMetadata extends QueueWorkerProcessDecoratorArgs {
  processor: QueueWorkerProcessor;
}

export enum QueueWorkerProcessorStatus {
  IN_PROGRESS = 0,
  SKIP = 1,
}

export type QueueWorkerExtraConfig = {
  // Run BEFORE the message is processed
  preProcessor?: (
    name: string,
    ...args: Parameters<QueueWorkerProcessor>
  ) => (QueueWorkerProcessorStatus | undefined | void) | Promise<QueueWorkerProcessorStatus | undefined | void>;
  // Run AFTER the message is processed
  postProcessor?: (name: string, ...args: Parameters<QueueWorkerProcessor>) => void | Promise<void>;
};

export interface QueueWorkerDecoratorArgs {
  names: QueueWorkerName[];

  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof QueueWorkerDecoratorArgs
   */
  priority: number;
}

export interface QueueWorkerProcessDecoratorArgs {
  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof QueueWorkerProcessDecoratorArgs
   */
  priority: number;
}

export type QueueWorkerRawMessage = {
  readonly data?: string | Uint8Array | Buffer | null;
  readonly headers?: Record<string, string>;
} & Record<string, any>;
export type QueueWorkerDecodedMessage<T = any> = {
  readonly data: Message<T>;
  readonly headers?: Record<string, string>;
  readonly raw: QueueWorkerRawMessage;
};

export type QueueWorkerReceivedMessage = {
  readonly message: QueueWorkerRawMessage;
};

export interface QueueWorkerControllerMetadata extends RequestMappingMetadata {
  /**
   * Default: 200
   *
   * @type {number}
   * @memberof QueueWorkerControllerMetadata
   */
  statusCode?: number;
}

export interface QueueWorkerControllerInterface {
  execute(body: QueueWorkerReceivedMessage, headers: Record<string, string>): Promise<void>;
}

import {
  Message,
  ModuleAsyncOptions,
  ModuleOptions,
  ModuleOptionsFactory,
  QueueWorkerName,
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
  className: string;
  instance: Injectable;
  processors: QueueWorkerProcessorMetadata[];
  name: QueueWorkerName;
  priority: number;
}

export interface QueueWorkerProcessorMetadata extends QueueWorkerProcessDecoratorArgs {
  workerName: QueueWorkerName;
  processorName: string;
  processor: QueueWorkerProcessor;
}

export interface QueueWorkerDecoratorArgs {
  names: QueueWorkerName[];

  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof QueueWorkerDecoratorArgs
   */
  priority: number;

  /**
   * If you want to disable the worker, set it to false. Defaults to true.
   */
  enabled?: boolean;
}

export interface QueueWorkerProcessDecoratorArgs {
  /**
   * Highest priority is 0, and lower the larger integer you use.
   *
   * @type {number}
   * @memberof QueueWorkerProcessDecoratorArgs
   */
  priority: number;

  /**
   * If you want to disable the process, set it to false. Defaults to true.
   */
  enabled?: boolean;
}

export type QueueWorkerRawMessage<T = any> = {
  readonly data?: string | null | Message<T>;
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

  /**
   * Whether to throw the error as is when Processor throws an error. Default is true.
   */
  throwError?: boolean;
}

export interface QueueWorkerControllerInterface {
  execute(body: QueueWorkerReceivedMessage, headers: Record<string, string>): Promise<void>;
}

export interface QueueWorkerOptions {
  /**
   * Worker name. If you want to define multiple names, use an array.
   */
  name: QueueWorkerName | QueueWorkerName[];

  /**
   * Highest priority is 0, and lower the larger integer you use.
   */
  priority?: number;

  /**
   * If you want to disable the worker, set it to false. Defaults to true.
   */
  enabled?: boolean;
}

export interface QueueWorkerProcessOptions {
  /**
   * Highest priority is 0, and lower the larger integer you use.
   */
  priority?: number;
  /**
   * If you want to disable the process, set it to false. Defaults to true.
   */
  enabled?: boolean;
}

export type QueueWorkerProcessResultBase<T = any> = {
  workerName: QueueWorkerName;
  processorName: string;
  data?: T;
  raw: QueueWorkerRawMessage<T>;
};

export type QueueWorkerProcessSuccessResult<T = any> = {
  success: true;
} & QueueWorkerProcessResultBase<T>;

export type QueueWorkerProcessFailureResult<T = any> = {
  success: false;
  error: Error;
} & QueueWorkerProcessResultBase<T>;

export type QueueWorkerProcessResult<T = any> = QueueWorkerProcessSuccessResult<T> | QueueWorkerProcessFailureResult<T>;

import {
  QueueWorkerDecodedMessage,
  QueueWorkerMetadata,
  QueueWorkerModuleOptions,
  QueueWorkerProcessorMetadata,
  QueueWorkerProcessResult,
  QueueWorkerProcessResultBase,
} from "./interfaces";

export class Worker<T> {
  /**
   * Worker name.
   */
  get name(): string {
    return this.metadata.name;
  }

  /**
   * Worker priority. The lower the number, the higher the priority.
   */
  get priority(): number {
    return this.metadata.priority;
  }

  /**
   * Class name with QueueWorker decorator.
   */
  get className(): string {
    return this.metadata.className;
  }

  constructor(
    private readonly metadata: QueueWorkerMetadata,
    private readonly options: QueueWorkerModuleOptions,
  ) {}

  /**
   * Execute all processors in the worker. If you want to execute a each processor, use `getProcessors` method.
   */
  public async execute(message: QueueWorkerDecodedMessage<T>): Promise<QueueWorkerProcessResult[]> {
    const results: QueueWorkerProcessResult[] = [];
    const processors = this.getProcessors();
    for (const processor of processors) {
      results.push(await processor.execute(message));
    }
    return results;
  }

  /**
   * Get all processors in the worker. Use this method to execute manually when you want to execute only on specific conditions using metadata such as class name or processor name.
   */
  public getProcessors(): Processor<T>[] {
    return this.metadata.processors.map((processor) => new Processor(processor, this.options));
  }
}

export class Processor<T> {
  /**
   * Processor name. This is `#{worker.className}.${processor.methodName}`.
   */
  get name(): string {
    return `${this.workerClassName}.${this.methodName}`;
  }

  /**
   * Processor priority. The lower the number, the higher the priority.
   */
  get priority(): number {
    return this.metadata.priority;
  }

  /**
   * The name of the processor that has this worker.
   */

  get workerName(): string {
    return this.metadata.workerName;
  }

  /**
   * The class name of the worker that has this processor.
   */
  get workerClassName(): string {
    return this.metadata.workerClassName;
  }

  /**
   * The method name of the processor with QueueWorkerProcess.
   */
  get methodName(): string {
    return this.metadata.methodName;
  }

  constructor(
    private readonly metadata: QueueWorkerProcessorMetadata,
    private readonly options: QueueWorkerModuleOptions,
  ) {}

  /**
   * Execute the processor.
   */
  public async execute(message: QueueWorkerDecodedMessage<T>): Promise<QueueWorkerProcessResult<T>> {
    const maxRetryAttempts = this.options.maxRetryAttempts ?? 1;

    const resultBase: QueueWorkerProcessResultBase<T> = {
      data: message.data.data,
      processorName: this.name,
      raw: message.raw,
      workerName: this.metadata.workerName,
    };

    for (let i = 0; i < maxRetryAttempts; i++) {
      try {
        await this.metadata.processor(message.data.data, message.raw);
        i = maxRetryAttempts;
      } catch (error: any) {
        if (maxRetryAttempts === i + 1) {
          return {
            error,
            success: false,
            ...resultBase,
          };
        }
      }
    }
    return {
      success: true,
      ...resultBase,
    };
  }
}

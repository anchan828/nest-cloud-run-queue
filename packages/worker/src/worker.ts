import {
  QueueWorkerDecodedMessage,
  QueueWorkerMetadata,
  QueueWorkerModuleOptions,
  QueueWorkerProcessorMetadata,
  QueueWorkerProcessResult,
  QueueWorkerProcessResultBase,
} from "./interfaces";

export class Worker<T> {
  get name(): string {
    return this.metadata.name;
  }

  get priority(): number {
    return this.metadata.priority;
  }

  get className(): string {
    return this.metadata.className;
  }

  constructor(
    private readonly message: QueueWorkerDecodedMessage<T>,
    private readonly metadata: QueueWorkerMetadata,
    private readonly options: QueueWorkerModuleOptions,
  ) {}

  /**
   * Execute all processors in the worker. If you want to execute a each processor, use `getProcessors` method.
   */
  public async execute(): Promise<QueueWorkerProcessResult[]> {
    const results: QueueWorkerProcessResult[] = [];
    const processors = this.getProcessors();
    for (const processor of processors) {
      results.push(await processor.execute());
    }
    return results;
  }

  /**
   * Get all processors in the worker. Use this method to execute manually when you want to execute only on specific conditions using metadata such as class name or processor name.
   */
  public getProcessors(): Processor<T>[] {
    return this.metadata.processors.map((processor) => new Processor(this.message, processor, this.options));
  }
}

export class Processor<T> {
  get name(): string {
    return this.metadata.processorName;
  }

  get priority(): number {
    return this.metadata.priority;
  }

  get workerName(): string {
    return this.metadata.workerName;
  }

  constructor(
    private readonly message: QueueWorkerDecodedMessage<T>,
    private readonly metadata: QueueWorkerProcessorMetadata,
    private readonly options: QueueWorkerModuleOptions,
  ) {}

  /**
   * Execute the processor.
   */
  public async execute(): Promise<QueueWorkerProcessResult<T>> {
    const maxRetryAttempts = this.options.maxRetryAttempts ?? 1;

    const resultBase: QueueWorkerProcessResultBase<T> = {
      data: this.message.data.data,
      processorName: this.metadata.processorName,
      raw: this.message.raw,
      workerName: this.metadata.workerName,
    };

    for (let i = 0; i < maxRetryAttempts; i++) {
      try {
        await this.metadata.processor(this.message.data.data, this.message.raw);
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

import { CloudRunPubSubMessage } from "@anchan828/nest-cloud-run-pubsub-common";
import { BadRequestException, Body, Controller, HttpCode, Inject, Logger, Post } from "@nestjs/common";
import {
  CLOUD_RUN_ALL_WORKERS_WORKER_NAME,
  CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS,
  CLOUD_RUN_UNHANDLED_WORKER_NAME,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
} from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import {
  CloudRunPubSubWorkerMetadata,
  CloudRunPubSubWorkerModuleOptions,
  CloudRunPubSubWorkerProcessor,
} from "./interfaces";
import { PubSubRootDto } from "./message.dto";
import { parseJSON } from "./util";

@Controller()
export class CloudRunPubSubWorkerController {
  constructor(
    @Inject(CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS) private readonly options: CloudRunPubSubWorkerModuleOptions,
    private readonly explorerService: CloudRunPubSubWorkerExplorerService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @HttpCode(204)
  public async root(@Body() info: PubSubRootDto): Promise<any> {
    const maxRetryAttempts = this.options.maxRetryAttempts ?? 1;
    const workers: CloudRunPubSubWorkerMetadata[] = [];
    const spetialWorkers: CloudRunPubSubWorkerMetadata[] = [];
    let data: CloudRunPubSubMessage<any> = { name: "" };

    try {
      data = this.decodeData(info.message.data);
      if (!data.name) {
        throw new Error(ERROR_WORKER_NAME_NOT_FOUND);
      }

      const allWorkers = this.explorerService.explore();

      workers.push(...allWorkers.filter((worker) => data.name === worker.name));

      spetialWorkers.push(
        ...allWorkers.filter((worker) =>
          [CLOUD_RUN_ALL_WORKERS_WORKER_NAME, CLOUD_RUN_UNHANDLED_WORKER_NAME].includes(worker.name),
        ),
      );

      if (workers.length === 0) {
        throw new Error(ERROR_WORKER_NOT_FOUND(data.name));
      }
    } catch (error) {
      this.logger.error(error.message);
      if (this.options?.throwModuleError && spetialWorkers.length === 0) {
        throw new BadRequestException(error.message);
      }
    }

    const processors = workers.map((w) => w.processors).flat();
    const spetialProcessors = spetialWorkers.map((w) => w.processors).flat();
    await this.options.extraConfig?.preProcessor?.(data.name, data.data, info.message.attributes, info);
    for (const processor of processors) {
      await this.execProcessor(processor, data.data, info, maxRetryAttempts);
    }

    for (const processor of spetialProcessors) {
      await this.execProcessor(processor, data, info, maxRetryAttempts);
    }
    await this.options.extraConfig?.postProcessor?.(data.name, data.data, info.message.attributes, info);
  }

  private async execProcessor<T>(
    processor: CloudRunPubSubWorkerProcessor,
    data: T,
    info: any,
    maxRetryAttempts: number,
  ): Promise<void> {
    for (let i = 0; i < maxRetryAttempts; i++) {
      try {
        await processor(data, info.message.attributes, info);
        i = maxRetryAttempts;
      } catch (error) {
        this.logger.error(error.message);
      }
    }
  }

  private decodeData(data: string): CloudRunPubSubMessage {
    const str = Buffer.from(data, "base64").toString();
    try {
      return parseJSON(str) as CloudRunPubSubMessage;
    } catch {
      throw new Error(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }
}

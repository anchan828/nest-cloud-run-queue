import { CloudRunPubSubMessage } from "@anchan828/nest-cloud-run-pubsub-common";
import { BadRequestException, Body, Controller, HttpCode, Inject, Logger, Post } from "@nestjs/common";
import {
  CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS,
  ERROR_INVALID_MESSAGE_FORMAT,
  ERROR_WORKER_NAME_NOT_FOUND,
  ERROR_WORKER_NOT_FOUND,
} from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import { CloudRunPubSubWorkerMetadata, CloudRunPubSubWorkerModuleOptions } from "./interfaces";
import { PubSubRootDto } from "./message.dto";

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
    let data: CloudRunPubSubMessage<any> = { name: "" };

    try {
      data = this.decodeData(info.message.data);

      if (!data.name) {
        throw new Error(ERROR_WORKER_NAME_NOT_FOUND);
      }

      workers.push(...this.explorerService.explore().filter((worker) => worker.name === data.name));

      if (workers.length === 0) {
        throw new Error(ERROR_WORKER_NOT_FOUND(data.name));
      }
    } catch (error) {
      this.logger.error(error.message);
      if (this.options?.throwModuleError) {
        throw new BadRequestException(error.message);
      }
    }

    const processors = workers.map((w) => w.processors).flat();

    for (const processor of processors) {
      for (let i = 0; i < maxRetryAttempts; i++) {
        try {
          await processor(data.data, info.message.attributes, info);
          i = maxRetryAttempts;
        } catch (error) {
          this.logger.error(error.message);
        }
      }
    }
  }

  private decodeData(data: string): CloudRunPubSubMessage {
    const str = Buffer.from(data, "base64").toString();
    try {
      return JSON.parse(str) as CloudRunPubSubMessage;
    } catch {
      throw new Error(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }
}

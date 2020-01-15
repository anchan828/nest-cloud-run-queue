import { CloudRunPubSubMessage } from "@anchan828/nest-cloud-run-pubsub-common";
import { BadRequestException, Body, Controller, HttpCode, Logger, Post } from "@nestjs/common";
import { ERROR_INVALID_MESSAGE_FORMAT, ERROR_WORKER_NAME_NOT_FOUND, ERROR_WORKER_NOT_FOUND } from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import { PubSubRootDto } from "./message.dto";

@Controller()
export class CloudRunPubSubWorkerController {
  constructor(private readonly explorerService: CloudRunPubSubWorkerExplorerService, private readonly logger: Logger) {}

  @Post()
  @HttpCode(204)
  public async root(@Body() info: PubSubRootDto): Promise<any> {
    const data = this.decodeData(info.message.data);

    if (!data.name) {
      this.logger.error(ERROR_WORKER_NAME_NOT_FOUND);
      throw new BadRequestException(ERROR_WORKER_NAME_NOT_FOUND);
    }

    const workers = this.explorerService.explore().filter(worker => worker.name === data.name);

    if (workers.length === 0) {
      const error = ERROR_WORKER_NOT_FOUND(data.name);
      this.logger.error(error);
      throw new BadRequestException(error);
    }

    for (const worker of workers) {
      for (const processor of worker.processors) {
        await processor(data.data, info.message.attributes, info);
      }
    }
  }

  private decodeData(data: string): CloudRunPubSubMessage {
    const str = Buffer.from(data, "base64").toString();
    try {
      return JSON.parse(str) as CloudRunPubSubMessage;
    } catch {
      this.logger.error(ERROR_INVALID_MESSAGE_FORMAT);
      throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }
}

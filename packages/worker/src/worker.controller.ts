import { CloudRunPubSubMessage } from "@anchan828/nest-cloud-run-pubsub-common";
import { BadRequestException, Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ERROR_INVALID_MESSAGE_FORMAT, ERROR_WORKER_NAME_NOT_FOUND, ERROR_WORKER_NOT_FOUND } from "./constants";
import { CloudRunPubSubWorkerExplorerService } from "./explorer.service";
import { PubSubRootDto } from "./message.dto";

@Controller()
export class CloudRunPubSubWorkerController {
  constructor(private readonly explorerService: CloudRunPubSubWorkerExplorerService) {}

  @Post()
  @HttpCode(204)
  public async root(@Body() info: PubSubRootDto): Promise<any> {
    const data = this.decodeData(info.message.data);

    if (!data.name) {
      throw new BadRequestException(ERROR_WORKER_NAME_NOT_FOUND);
    }

    const workers = this.explorerService.explore().filter(worker => worker.name === data.name);

    if (workers.length === 0) {
      throw new BadRequestException(ERROR_WORKER_NOT_FOUND(data.name));
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
      throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
    }
  }
}

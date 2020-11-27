import { Body, Controller, HttpCode, Post, Request } from "@nestjs/common";
import { PubSubReceivedMessageDto } from "./message.dto";
import { CloudRunPubSubWorkerService } from "./worker.service";

@Controller()
export class CloudRunPubSubWorkerController {
  constructor(private readonly service: CloudRunPubSubWorkerService) {}

  @Post()
  @HttpCode(204)
  public async root(@Body() info: PubSubReceivedMessageDto, @Request() req: Record<string, any>): Promise<void> {
    await this.service.execute(info.message, req.body);
  }
}

import { Body, Controller, Headers, HttpCode, RequestMapping, RequestMethod, Type } from "@nestjs/common";
import {
  QueueWorkerControllerInterface,
  QueueWorkerReceivedMessage,
  QueueWorkerControllerMetadata,
} from "./interfaces";
import { QueueWorkerService } from "./worker.service";

export function getWorkerController(metadata?: QueueWorkerControllerMetadata): Type<QueueWorkerControllerInterface> {
  const path = metadata?.path;
  const method = metadata?.method || RequestMethod.POST;
  @Controller()
  class WorkerController implements QueueWorkerControllerInterface {
    constructor(private readonly service: QueueWorkerService) {}

    @RequestMapping({ method, path })
    @HttpCode(metadata?.statusCode || 200)
    public async execute(
      @Body() body: QueueWorkerReceivedMessage,
      @Headers() headers: Record<string, string>,
    ): Promise<void> {
      await this.service.execute({ ...body.message, headers });
    }
  }

  return WorkerController;
}

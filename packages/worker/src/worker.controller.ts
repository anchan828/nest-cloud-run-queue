import { Body, Controller, Headers, HttpCode, RequestMapping, RequestMethod, Type } from "@nestjs/common";
import {
  CloudRunQueueWorkerControllerInterface,
  CloudRunReceivedMessage,
  CloudRunQueueWorkerControllerMetadata,
} from "./interfaces";
import { CloudRunQueueWorkerService } from "./worker.service";

export function getWorkerController(
  metadata?: CloudRunQueueWorkerControllerMetadata,
): Type<CloudRunQueueWorkerControllerInterface> {
  const path = metadata?.path;
  const method = metadata?.method || RequestMethod.POST;
  @Controller()
  class CloudRunQueueWorkerController implements CloudRunQueueWorkerControllerInterface {
    constructor(private readonly service: CloudRunQueueWorkerService) {}

    @RequestMapping({ method, path })
    @HttpCode(metadata?.statusCode || 200)
    public async execute(
      @Body() body: CloudRunReceivedMessage,
      @Headers() headers: Record<string, string>,
    ): Promise<void> {
      await this.service.execute({ ...body.message, headers });
    }
  }

  return CloudRunQueueWorkerController;
}

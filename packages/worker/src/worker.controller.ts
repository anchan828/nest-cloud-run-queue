import { Body, Controller, Headers, HttpCode, RequestMapping, RequestMethod, Type } from "@nestjs/common";
import {
  CloudRunWorkerControllerInterface,
  CloudRunReceivedMessage,
  CloudRunWorkerControllerMetadata,
} from "./interfaces";
import { CloudRunWorkerService } from "./worker.service";

export function getWorkerController(
  metadata?: CloudRunWorkerControllerMetadata,
): Type<CloudRunWorkerControllerInterface> {
  const path = metadata?.path;
  const method = metadata?.method || RequestMethod.POST;
  @Controller()
  class CloudRunWorkerController implements CloudRunWorkerControllerInterface {
    constructor(private readonly service: CloudRunWorkerService) {}

    @RequestMapping({ method, path })
    @HttpCode(metadata?.statusCode || 200)
    public async execute(
      @Body() body: CloudRunReceivedMessage,
      @Headers() headers: Record<string, string>,
    ): Promise<void> {
      await this.service.execute({ ...body.message, headers });
    }
  }

  return CloudRunWorkerController;
}

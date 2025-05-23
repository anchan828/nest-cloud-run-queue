import { CloudTasksClient } from "@google-cloud/tasks";
import { Inject, Injectable } from "@nestjs/common";
import { TASKS_CLIENT, TASKS_PUBLISHER_MODULE_OPTIONS } from "./constants";
import { PublishData, PublishOptions, TasksPublisherModuleOptions } from "./interfaces";

@Injectable()
export class TasksPublisherService {
  constructor(
    @Inject(TASKS_PUBLISHER_MODULE_OPTIONS)
    private readonly options: TasksPublisherModuleOptions,
    @Inject(TASKS_CLIENT) private readonly client: CloudTasksClient,
  ) {}

  public async publish<T>(message: PublishData<T>, options?: PublishOptions): Promise<string> {
    const taskMessage = this.options.extraConfig?.prePublish
      ? await this.options.extraConfig?.prePublish(message)
      : message;

    const queue = options?.queue || this.options.queue;

    const [task] = await this.client.createTask({
      parent: queue,
      task: {
        name: options?.deduplicationId ? `${queue}/tasks/${options.deduplicationId}` : undefined,
        ...this.options.publishConfig,
        ...options,
        httpRequest: {
          body: Buffer.from(
            JSON.stringify({ message: taskMessage || {} }, this.options.extraConfig?.stringifyReplacer),
          ).toString("base64"),
          headers: {
            "content-type": "application/json",
            ...options?.httpRequest?.headers,
            ...this.options.publishConfig?.httpRequest?.headers,
          },
          httpMethod: options?.httpRequest?.httpMethod || this.options.publishConfig?.httpRequest?.httpMethod || "POST",
          oauthToken: options?.httpRequest?.oauthToken || this.options.publishConfig?.httpRequest?.oauthToken,
          oidcToken: options?.httpRequest?.oidcToken || this.options.publishConfig?.httpRequest?.oidcToken,
          url: options?.httpRequest?.url || this.options.publishConfig?.httpRequest?.url,
        },
      },
    });

    const taskName = task?.name || "";

    if (this.options.extraConfig?.postPublish) {
      await this.options.extraConfig?.postPublish(taskMessage, taskName);
    }

    return taskName;
  }
}

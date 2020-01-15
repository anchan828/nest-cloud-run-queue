export const CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS = "CLOUD_RUN_PUBSUB_WORKER_MODULE_OPTIONS";
export const CLOUD_RUN_PUBSUB_WORKER_DECORATOR = "CLOUD_RUN_PUBSUB_WORKER_DECORATOR";
export const CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR = "CLOUD_RUN_PUBSUB_WORKER_PROCESS_DECORATOR";

// errors
export const ERROR_INVALID_MESSAGE_FORMAT = "Invalid Pub/Sub message format.";
export const ERROR_WORKER_NAME_NOT_FOUND = "Worker name not found.";
export const ERROR_WORKER_NOT_FOUND = (name: string): string => `Worker '${name}' not found.`;

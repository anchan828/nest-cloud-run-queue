export const QUEUE_WORKER_MODULE_OPTIONS = "QUEUE_WORKER_MODULE_OPTIONS";
export const QUEUE_WORKER_DECORATOR = "QUEUE_WORKER_DECORATOR";
export const QUEUE_WORKER_PROCESS_DECORATOR = "QUEUE_WORKER_PROCESS_DECORATOR";

// errors
export const ERROR_INVALID_MESSAGE_FORMAT =
  "Invalid message format. The message must be an object that has a 'name' property.";
export const ERROR_QUEUE_WORKER_NAME_NOT_FOUND = "Worker name not found.";
export const ERROR_WORKER_NOT_FOUND = (name: string): string => `Worker '${name}' not found.`;

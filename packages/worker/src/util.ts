import { Message } from "@anchan828/nest-cloud-run-queue-common";
import { BadRequestException } from "@nestjs/common";
import { ERROR_INVALID_MESSAGE_FORMAT } from "./constants";
import { QueueWorkerDecodedMessage, QueueWorkerRawMessage } from "./interfaces";

const dateRegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * parse json string to javascript object.
 * JSON.parse has receiver for Date.parse.
 * @param json
 */
export const parseJSON = <T>(json: string, reviver?: (key: string, value: any) => any): T => {
  return JSON.parse(json, (key: string, value: any): any =>
    reviver ? reviver(key, parseDate(key, value)) : parseDate(key, value),
  );
};

function parseDate(key: string, value: any): any {
  if (typeof value === "string" && value.length === 24 && dateRegExp.test(value)) {
    const date = new Date(value);
    if (+date === +date) {
      return date;
    }
  }
  return value;
}

/**
 * sort array by priority prop
 *
 * @export
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
export function sortByPriority<T extends { priority: number }>(items: T[]): T[] {
  return items.sort((x, y) => x.priority - y.priority);
}

const customBase64Strs = ["e30"];

/**
 * Check if a string is base64 encoded.
 *
 * @export
 * @param {string} value
 * @return {*}  {boolean}
 */
export function isBase64<T = any>(value?: string | null | Message<T>): value is string {
  if (!value) {
    return false;
  }

  if (typeof value !== "string") {
    return false;
  }

  const len = value.length;

  if (len <= 4 && customBase64Strs.some((base64Str) => value.startsWith(base64Str))) {
    return true;
  }

  if ((len === 4 && ![2, 3].every((n) => value[n] === "=")) || !len || len % 4 !== 0 || /[^A-Z0-9+/=]/i.test(value)) {
    return false;
  }

  const firstPaddingChar = value.indexOf("=");
  return (
    firstPaddingChar === -1 || firstPaddingChar === len - 1 || (firstPaddingChar === len - 2 && value[len - 1] === "=")
  );
}

export function decodeMessage<T = any>(
  message: QueueWorkerRawMessage<T> | Message,
  reviver?: (key: string, value: any) => any,
): QueueWorkerDecodedMessage<T> {
  let data: Message<T>;
  if (isBase64(message.data)) {
    // pubsub
    data = decodeData<T>(message.data, reviver);
  } else if (isTaskMessage<T>(message)) {
    // tasks
    data = { data: JSON.parse(JSON.stringify(message.data), reviver), name: message.name };
  } else {
    // http / raw
    const _message = isMessage<T>(message) ? message : isMessage<T>(message.data) ? message.data : undefined;

    if (!_message) {
      throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
    }

    data = _message;
  }

  if (!data) {
    throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
  }

  return {
    data,
    headers: "headers" in message ? message.headers : undefined,
    id: getMessageId(message),
    raw: message,
  };
}

export function isDecodedMessage<T = any>(
  message: QueueWorkerRawMessage<T> | QueueWorkerDecodedMessage<T> | Message<T>,
): message is QueueWorkerDecodedMessage<T> {
  return "raw" in message;
}

export function isTaskMessage<T>(
  message?: QueueWorkerRawMessage<T> | Message<T> | null,
): message is Message<T> & { headers?: Record<string, string> } {
  if (!message) {
    return false;
  }

  const keys = Object.keys(message);
  return keys.length <= 3 && keys.includes("name") && keys.includes("headers");
}

export function isMessage<T>(message?: QueueWorkerRawMessage<T> | Message<T> | null): message is Message<T> {
  if (!message) {
    return false;
  }

  const keys = Object.keys(message);
  return keys.length <= 3 && keys.includes("name");
}

function getMessageId<T>(raw: QueueWorkerRawMessage<T> | Message<T>): string {
  if (!raw) {
    return "";
  }

  if ("messageId" in raw) {
    return raw.messageId ?? "";
  }

  if ("headers" in raw && raw.headers?.["x-cloudtasks-taskname"]) {
    return raw.headers["x-cloudtasks-taskname"];
  }

  return "";
}

function decodeData<T = any>(
  data?: string | Uint8Array | Buffer | null,
  reviver?: (key: string, value: any) => any,
): Message<T> {
  if (!data) {
    throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
  }

  if (Buffer.isBuffer(data)) {
    data = data.toString();
  }

  if (data instanceof Uint8Array) {
    data = new TextDecoder("utf8").decode(data);
  }

  if (isBase64(data)) {
    data = Buffer.from(data, "base64").toString();
  }
  try {
    if (typeof data === "string") {
      return parseJSON(data, reviver) as Message;
    }

    return data;
  } catch {
    throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
  }
}

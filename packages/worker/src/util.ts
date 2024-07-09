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
export const parseJSON = <T>(json: string): T => {
  return JSON.parse(json, (_: string, value: any): any => {
    if (typeof value === "string" && value.length === 24 && dateRegExp.test(value)) {
      const date = new Date(value);
      if (+date === +date) {
        return date;
      }
    }
    return value;
  });
};

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
export function isBase64(value?: string | null | Message): value is string {
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

  if ((len === 4 && ![2, 3].every((n) => value[n] === "=")) || !len || len % 4 !== 0 || /[^A-Z0-9+\/=]/i.test(value)) {
    return false;
  }

  const firstPaddingChar = value.indexOf("=");
  return (
    firstPaddingChar === -1 || firstPaddingChar === len - 1 || (firstPaddingChar === len - 2 && value[len - 1] === "=")
  );
}

export function decodeMessage<T = any>(message: QueueWorkerRawMessage | Message): QueueWorkerDecodedMessage<T> {
  let data: Message<T>;

  if (isBase64(message.data)) {
    // pubsub
    data = decodeData<T>(message.data);
  } else {
    // tasks / http
    data = message as Message<T>;
  }

  return {
    data,
    headers: "headers" in message ? message.headers : undefined,
    id: getMessageId(message),
    raw: message,
  };
}

function getMessageId(raw: QueueWorkerRawMessage): string {
  return raw.messageId ?? raw.headers?.["x-cloudtasks-taskname"] ?? "";
}

function decodeData<T = any>(data?: string | Uint8Array | Buffer | null): Message<T> {
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
      return parseJSON(data) as Message;
    }

    return data;
  } catch {
    throw new BadRequestException(ERROR_INVALID_MESSAGE_FORMAT);
  }
}

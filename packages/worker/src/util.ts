import { Message } from "@anchan828/nest-cloud-run-queue-common";

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

/**
 * parse json string to javascript object.
 * JSON.parse has receiver for Date.parse.
 * @param json
 */
export const parseJSON = <T>(json: string): T | undefined => {
  return JSON.parse(json, (_: string, value: any): any => {
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
      const date = Date.parse(value);
      if (!isNaN(date)) {
        return new Date(date);
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

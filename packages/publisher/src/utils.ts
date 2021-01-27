/**
 * wait
 *
 * @export
 * @param {number} millisecond
 * @return {*}  {Promise<void>}
 */
export function wait(millisecond: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millisecond));
}

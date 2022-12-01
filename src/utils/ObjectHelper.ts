/**
 * Object diff returns all fields with values from b, that are different from a
 * @param a
 * @param b
 */
export function objectDiff(a: unknown, b: unknown) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const diff = {};
  const jsonA = JSON.parse(JSON.stringify(a));
  const jsonB = JSON.parse(JSON.stringify(b));
  for (const element in jsonA) {
    if (element === "_id") {
      continue;
    }
    if (jsonB[element] !== null) {
      if (jsonB[element] !== jsonA[element]) {
        // eslint-disable-next-line security/detect-object-injection,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        diff[element] = jsonB[element];
      }
    }
  }

  return diff;
}
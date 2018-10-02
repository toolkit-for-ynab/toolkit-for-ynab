export function mapToArray(map) {
  const array = [];
  for (const [, value] of map) {
    array.push(value);
  }

  return array;
}

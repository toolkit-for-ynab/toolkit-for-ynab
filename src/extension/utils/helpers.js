export function mapToArray(map) {
  const array = [];
  for (const [, value] of map) {
    array.push(value);
  }

  return array;
}

export function compareSemanticVersion(left, right) {
  const leftSplit = left.split('.').map(val => parseInt(val, 10));
  const rightSplit = right.split('.').map(val => parseInt(val, 10));

  while (leftSplit.length < rightSplit.length) {
    leftSplit.push(0);
  }

  while (rightSplit.length < leftSplit.length) {
    rightSplit.push(0);
  }

  for (let x = 0; x < leftSplit.length; x++) {
    if (leftSplit[x] === rightSplit[x]) {
      continue; // eslint-disable-line no-continue
    }

    if (leftSplit[x] > rightSplit[x]) {
      return 1;
    }

    if (leftSplit[x] < rightSplit[x]) {
      return -1;
    }
  }

  return 0;
}

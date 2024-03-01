export interface YNABCollection<T> {
  forEach(callbackFn: (value: T, index: number) => void): void;
}

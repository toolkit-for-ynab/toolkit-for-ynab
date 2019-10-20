export const pause = (timeout = 0) => new Promise(resolve => setTimeout(() => resolve(), timeout));

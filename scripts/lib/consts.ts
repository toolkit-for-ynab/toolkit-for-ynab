export const BROWSER_NAMES = ['chrome', 'firefox', 'edge'] as const;

export type BrowserName = typeof BROWSER_NAMES[number];

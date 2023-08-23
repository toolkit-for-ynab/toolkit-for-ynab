export const isYNABReady = jest.fn().mockReturnValue(false);
export const getCurrentRouteName = jest.fn().mockReturnValue('');
export const ynabRequire = (global as any).requireModule;

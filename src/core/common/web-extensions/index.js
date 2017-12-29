export const getBrowser = () => {
  if (typeof browser !== 'undefined') {
    return browser;
  } else if (typeof window.chrome !== 'undefined') {
    return window.chrome;
  }
};

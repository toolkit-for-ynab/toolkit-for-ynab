export class Runtime {
  listeners = [];

  getManifest = jest.fn(() => {
    return {};
  });

  getURL = jest.fn((path) => {
    return `chrome-extension://${path}`;
  });

  onMessage = {
    addListener: jest.fn((callback) => {
      this.listeners.push(callback);
    })
  };

  mock = {
    sendMessage: (message) => {
      const responseSpy = jest.fn();
      this.listeners.forEach((listener) => listener(message, {}, responseSpy));
      return responseSpy;
    }
  }
}

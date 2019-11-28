export class Runtime {
  onMessageListeners = [];

  onUpdateAvailableListeners = [];

  getManifest = jest.fn(() => {
    return {};
  });

  getURL = jest.fn(path => {
    return `chrome-extension://${path}`;
  });

  onMessage = {
    addListener: jest.fn(callback => {
      this.onMessageListeners.push(callback);
    }),
  };

  onUpdateAvailable = {
    addListener: jest.fn(callback => {
      this.onUpdateAvailableListeners.push(callback);
    }),
  };

  requestUpdateCheck = jest.fn();

  mock = {
    triggerOnMessage: message => {
      const responseSpy = jest.fn();
      this.onMessageListeners.forEach(listener => listener(message, {}, responseSpy));
      return responseSpy;
    },

    triggerOnUpdateAvailable: status => {
      this.onUpdateAvailableListeners.forEach(listener => listener(status));
    },
  };
}

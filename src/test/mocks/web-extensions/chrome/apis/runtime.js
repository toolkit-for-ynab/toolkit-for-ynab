export class Runtime {
  constructor() {
    this.getURL = jest.fn((path) => {
      return `chrome-extension://${path}`;
    });

    this.onMessage = {
      addListener: jest.fn()
    };
  }
}

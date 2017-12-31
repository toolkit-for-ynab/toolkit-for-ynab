import * as { Background } from './background';

describe('background.js', () => {
  it('should attach a listener to the runtime onMessage handler', () => {
    console.log('testing');
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  describe('on storage messages', () => {
    describe('on type: keys', () => {

    });

    describe('on type: get', () => {

    });

    describe('on an unexpected type', () => {

    });
  });

  describe('on unexpected messages', () => {

  });
});

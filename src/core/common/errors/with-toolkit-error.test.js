import { logToolkitError, withToolkitError } from './with-toolkit-error';
import { readyYNAB } from 'toolkit/test/setup';

describe('toolkit error utils', () => {
  const originalConsoleWarn = global.console.warn.bind(global.console);
  const originalConsoleError = global.console.error.bind(global.console);
  beforeEach(() => {
    global.console.warn = jest.fn();
    global.console.error = jest.fn();
  });

  afterEach(() => {
    global.console.warn = originalConsoleWarn;
    global.console.error = originalConsoleError;
  });

  describe('withToolkitError', () => {
    it('should error if the first argument is not a function', () => {
      expect(() => {
        withToolkitError('not a function', 'test');
      }).toThrowErrorMatchingSnapshot();
    });

    it('should log a warning if the second argument is not a feature instance or feature name', () => {
      const innerFunction = jest.fn();
      const wrappedFunc = withToolkitError(innerFunction, 'doesntexist');
      expect(console.warn).toHaveBeenCalledWith(
        "Second argument to withToolkitError should either be Feature Class or Feature Name as found in the feature's settings.js file"
      );
      expect(wrappedFunc).toEqual(expect.any(Function));
    });

    describe('given valid arguments', () => {
      beforeEach(() => {
        readyYNAB({ ynabToolKit: { options: { mockSetting: true } } });
      });

      it('should return a wrappedFunction', () => {
        const innerFunction = jest.fn();
        const wrappedFunc = withToolkitError(innerFunction, 'mockSetting');
        expect(console.warn).not.toHaveBeenCalled();
        expect(wrappedFunc).toEqual(expect.any(Function));
      });

      describe('the wrapped function', () => {
        it('should catch errors and log a toolkit error message', () => {
          const innerFunction = jest.fn().mockImplementation(() => {
            throw Error('mock error');
          });

          const wrappedFunc = withToolkitError(innerFunction, 'mockSetting');
          expect(() => {
            wrappedFunc();
          }).not.toThrow();
          expect(console.error).toHaveBeenCalled();
        });

        it('should return the return value of the wrapped function', () => {
          const mockReturn = 'mock return';
          const innerFunction = jest.fn().mockReturnValue(mockReturn);
          const wrappedFunc = withToolkitError(innerFunction, 'mockSetting');
          expect(wrappedFunc()).toEqual(mockReturn);
        });
      });
    });
  });

  describe('logToolkitError', () => {
    it('should log a detailed toolkit error the the console', () => {
      const mockError = new Error('mock error');
      logToolkitError({
        exception: mockError,
        featureName: 'mock feature',
        featureSetting: 'false',
        functionName: 'observe',
      });

      expect(console.error).toHaveBeenCalledWith(
        `Toolkit Error:
  - Feature: mock feature
  - Feature Setting: false
  - Function: observe
  - Message: mock error`,
        mockError.stack
      );
    });

    it('should send the error to the background via post message with omitted IDs', () => {
      const postMessageSpy = jest.spyOn(window, 'postMessage');
      const mockError = new Error('mock error');
      logToolkitError({
        exception: mockError,
        featureName: 'mock feature',
        featureSetting: 'false',
        functionName: 'observe',
      });

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          context: {
            featureName: 'mock feature',
            featureSetting: 'false',
            functionName: 'observe',
            routeName: '/omitted/budget/201802',
            serializedError: mockError.stack.toString(),
          },
          type: 'ynab-toolkit-error',
        },
        '*'
      );
    });
  });
});

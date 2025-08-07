jest.mock('toolkit/extension/features/feature');

describe('ToolkitReports Feature Flag Tests', () => {
  let ToolkitReports;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock ynabToolKit
    global.ynabToolKit = {
      options: {},
    };

    // Mock the utils module
    jest.doMock('./utils/url-navigation', () => ({
      navigateToToolkitReports: jest.fn(),
      isToolkitReportsURL: jest.fn(),
    }));

    // Import the feature after mocking
    ToolkitReports = require('./index').ToolkitReports;
  });

  describe('_isURLNavigationEnabled', () => {
    let feature;

    beforeEach(() => {
      feature = new ToolkitReports();
    });

    it('should return true when ToolkitReportsURLNavigation is enabled', () => {
      global.ynabToolKit.options.ToolkitReportsURLNavigation = true;
      expect(feature._isURLNavigationEnabled()).toBe(true);
    });

    it('should return false when ToolkitReportsURLNavigation is disabled', () => {
      global.ynabToolKit.options.ToolkitReportsURLNavigation = false;
      expect(feature._isURLNavigationEnabled()).toBe(false);
    });

    it('should return false when ToolkitReportsURLNavigation is undefined', () => {
      global.ynabToolKit.options.ToolkitReportsURLNavigation = undefined;
      expect(feature._isURLNavigationEnabled()).toBe(false);
    });

    it('should return false when ynabToolKit.options is undefined', () => {
      global.ynabToolKit.options = undefined;
      expect(feature._isURLNavigationEnabled()).toBe(false);
    });

    it('should return false when ynabToolKit is undefined', () => {
      global.ynabToolKit = undefined;
      expect(feature._isURLNavigationEnabled()).toBe(false);
    });
  });

  describe('Feature flag integration', () => {
    let feature;

    beforeEach(() => {
      feature = new ToolkitReports();
    });

    it('should respect the feature flag setting', () => {
      // Test with flag enabled
      global.ynabToolKit.options.ToolkitReportsURLNavigation = true;
      expect(feature._isURLNavigationEnabled()).toBe(true);

      // Test with flag disabled
      global.ynabToolKit.options.ToolkitReportsURLNavigation = false;
      expect(feature._isURLNavigationEnabled()).toBe(false);
    });

    it('should default to false when setting is not present', () => {
      delete global.ynabToolKit.options.ToolkitReportsURLNavigation;
      expect(feature._isURLNavigationEnabled()).toBe(false);
    });
  });
});

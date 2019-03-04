export const mockToolkitStorage = {
  getFeatureSetting: jest.fn(),
  getFeatureSettings: jest.fn(),
  setFeatureSetting: jest.fn(),
  getStorageItem: jest.fn(),
  removeStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
  getStoredFeatureSettings: jest.fn(),
  on: jest.fn(),
  onFeatureSettingChanged: jest.fn(),
  off: jest.fn(),
  offFeatureSettingChanged: jest.fn(),
  mock: {
    clearMock: () => {
      Object.values(mockToolkitStorage).forEach(value => {
        if (jest.isMockFunction(value)) {
          value.mockClear();
        }
      });
    },
  },
};

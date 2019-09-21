import { StorageArea } from './storage-area';

export class Storage {
  _listeners = [];

  _storageAreaNames = ['local', 'sync'];

  onChanged = {
    addListener: jest.fn(callback => {
      this._listeners.push(callback);
    }),
  };

  constructor() {
    this._storageAreaNames.forEach(storageArea => {
      this[storageArea] = new StorageArea();
    });
  }

  mock = {
    triggerOnChangedListeners: (data, areaName) => {
      this._listeners.forEach(listener => {
        listener(data, areaName);
      });
    },

    setStorageData: mockData => {
      this._storageAreaNames.forEach(storageArea => {
        this[storageArea].mock.setData(mockData);
      });
    },
  };
}

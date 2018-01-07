class StorageArea {
  data = {};

  get = jest.fn((key, callback) => {
    callback({ [key]: this.data[key] });
  });

  set = jest.fn((update, callback) => {
    this.data = {
      ...this.data,
      ...update
    };

    callback();
  });

  mock = {
    setData: (data) => {
      this.data = data;
    }
  }
}

export class Storage {
  _storageAreaNames = ['local', 'sync'];

  onChanged = {
    addListener: jest.fn()
  }

  constructor() {
    this._storageAreaNames.forEach((storageArea) => {
      this[storageArea] = new StorageArea();
    });
  }

  mock = {
    setStorageData: (mockData) => {
      this._storageAreaNames.forEach((storageArea) => {
        this[storageArea].mock.setData(mockData);
      });
    }
  }
}

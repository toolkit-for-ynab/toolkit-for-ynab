class StorageArea {
  data = {};

  get = jest.fn((key, callback) => {
    if (key === null) {
      return callback(this.data);
    }

    callback({ [key]: this.data[key] });
  });

  set = jest.fn((update, callback) => {
    this.data = {
      ...this.data,
      ...update,
    };

    callback();
  });

  remove = jest.fn(key => {
    delete this.data[key];
  });

  mock = {
    setData: data => {
      this.data = data;
    },
  };
}

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

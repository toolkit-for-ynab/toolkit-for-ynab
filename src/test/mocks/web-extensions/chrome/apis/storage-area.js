export class StorageArea {
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

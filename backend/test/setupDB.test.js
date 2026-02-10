const mongoose = require('mongoose');
const { getWorkerUriOptions, connectTestDB } = require('../src/config/setupDB');

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true)
}));

describe('getWorkerUriOptions', () => {

  test('dbName específico si hay workerId y baseDb', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
    process.env.JEST_WORKER_ID = '1';

    const { options } = getWorkerUriOptions();
    expect(options.dbName).toBe('testdb-worker-1');
  });

  test('retorna vacío si no hay workerId', () => {
    delete process.env.JEST_WORKER_ID;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';

    const { options } = getWorkerUriOptions();
    expect(options).toEqual({});
  });

  test('retorna vacío si URI no tiene dbName', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/';
    process.env.JEST_WORKER_ID = '1';

    const { options } = getWorkerUriOptions();
    expect(options).toEqual({});
  });

});

describe('connectTestDB', () => {

  test('llama a mongoose.connect', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
    await expect(connectTestDB()).resolves.not.toThrow();
    expect(mongoose.connect).toHaveBeenCalled();
  });

});

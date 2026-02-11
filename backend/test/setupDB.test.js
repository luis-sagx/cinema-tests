const mongoose = require('mongoose');
const { connectTestDB, closeTestDB } = require('../src/config/setupDB');

// Mock mongoose
jest.mock('mongoose', () => {
  const mockConnect = jest.fn().mockResolvedValue({});
  const mockClose = jest.fn().mockResolvedValue({});
  return {
    connect: mockConnect,
    connection: {
      readyState: 0,
      close: mockClose
    }
  };
});

// Mock mongodb-memory-server
jest.mock('mongodb-memory-server', () => ({
  MongoMemoryServer: {
    create: jest.fn().mockResolvedValue({
      getUri: jest.fn().mockReturnValue('mongodb://mem-server/test'),
      stop: jest.fn().mockResolvedValue({})
    })
  }
}));

describe('connectTestDB and closeTestDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.MONGODB_URI;
    delete process.env.JEST_WORKER_ID;
  });

  test('conecta usando MongoMemoryServer si no hay MONGODB_URI', async () => {
    // Act
    await connectTestDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(
      expect.stringContaining('mongodb://'),
      {}
    );
  });

  test('conecta usando MONGODB_URI si está presente', async () => {
    // Arrange
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';

    // Act
    await connectTestDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/testdb',
      {}
    );
  });

  test('usa dbName específico si hay JEST_WORKER_ID', async () => {
    // Arrange
    process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
    process.env.JEST_WORKER_ID = '2';

    // Act
    await connectTestDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/testdb',
      { dbName: 'testdb-worker-2' }
    );
  });

  test('closeTestDB cierra la conexión', async () => {
    // Act
    await closeTestDB();

    // Assert
    expect(mongoose.connection.close).toHaveBeenCalled();
  });
});

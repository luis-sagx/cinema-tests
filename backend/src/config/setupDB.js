const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connectTestDB() {
  // Si ya estamos conectados (por ejemplo, en watch mode), no hacemos nada
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  let uri = process.env.MONGODB_URI;
  const options = {};

  if (!uri) {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create();
    }
    uri = mongoServer.getUri();
  } else {
    const workerId = process.env.JEST_WORKER_ID;
    if (workerId) {
      const match = String(uri).match(/\/([^/?]+)(\?|$)/);
      const baseDb = match ? match[1] : null;
      if (baseDb) {
        options.dbName = `${baseDb}-worker-${workerId}`;
      }
    }
  }

  return mongoose.connect(uri, options);
}

async function closeTestDB() {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connectTestDB, closeTestDB };

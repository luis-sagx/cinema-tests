const mongoose = require('mongoose');

function getWorkerUriOptions() {
  const uri = process.env.MONGODB_URI;
  const workerId = process.env.JEST_WORKER_ID;
  if (workerId) {
    const match = String(uri).match(/\/([^\/?]+)(\?|$)/);
    const baseDb = match ? match[1] : null;
    if (baseDb) {
      const dbName = `${baseDb}-worker-${workerId}`;
      console.log(`Using worker-specific database for tests: ${dbName}`);
      return { uri, options: { dbName } };
    }
  }
  return { uri, options: {} };
}

async function connectTestDB() {
  const { uri, options } = getWorkerUriOptions();
  return mongoose.connect(uri, options);
}

module.exports = { connectTestDB };

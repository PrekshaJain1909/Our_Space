// Simple MongoDB connection tester. Reads MONGO_URI from .env or env and
// attempts to connect, printing helpful error output.
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

(async () => {
  if (!uri) {
    console.error('MONGO_URI is not set in environment or .env');
    process.exit(2);
  }

  console.log('Testing MongoDB connection (masked):');
  try {
    // Show masked host (avoid printing credentials)
    try {
      const u = new URL(uri.replace('mongodb+srv://', 'http://'));
      console.log('Host:', u.host);
    } catch (e) {
      // ignore
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB: connected successfully');
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:');
    console.error(err && err.message ? err.message : String(err));
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
})();

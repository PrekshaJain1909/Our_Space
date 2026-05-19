const fs = require('fs');
const path = require('path');

// If MONGO_URI is provided, use MongoDB. Otherwise, fall back to file DB.
const MONGO_URI = process.env.MONGO_URI || process.env.DB_URI || 'mongodb+srv://prekjainsha190994_db_user:<db_password>@cluster0.eqvz71g.mongodb.net/?appName=Cluster0';
console.log(`MongoDB_URI: ${MONGO_URI.includes('<db_password>') ? '***hidden***' : MONGO_URI}`);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

let mongoClient = null;
let mongoDb = null;

async function connectMongo() {
  if (!MONGO_URI || MONGO_URI.includes('<db_password>')) return null;
  if (mongoDb) return mongoDb;
  try {
    // Log a masked version of the URI (do not print password)
    try {
      const url = new URL(MONGO_URI.replace('mongodb+srv://', 'http://'));
      console.log(`Attempting MongoDB connection to host: ${url.host}`);
    } catch (err) {
      // ignore parsing errors
    }
    const { MongoClient } = require('mongodb');
    mongoClient = new MongoClient(MONGO_URI, { maxPoolSize: 10 });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    console.log('Connected to MongoDB');
    return mongoDb;
  } catch (e) {
    console.warn('Could not connect to MongoDB, falling back to file DB.', e.message || e);
    mongoClient = null;
    mongoDb = null;
    return null;
  }
}

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function ensureResource(obj, name) {
  if (!obj[name]) obj[name] = [];
}

async function all(name) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection(name);
    const docs = await col.find({}).toArray();
    return docs;
  }
  const local = readDB();
  ensureResource(local, name);
  return local[name];
}

async function find(name, id) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection(name);
    const doc = await col.findOne({ id: id });
    return doc || null;
  }
  const items = readDB()[name] || [];
  return items.find((i) => i.id === id) || null;
}

async function create(name, item) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection(name);
    await col.insertOne(item);
    return item;
  }
  const data = readDB();
  ensureResource(data, name);
  data[name].push(item);
  writeDB(data);
  return item;
}

async function update(name, id, patch) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection(name);
    const res = await col.findOneAndUpdate({ id }, { $set: patch }, { returnDocument: 'after' });
    return res.value || null;
  }
  const data = readDB();
  ensureResource(data, name);
  const idx = data[name].findIndex((i) => i.id === id);
  if (idx === -1) return null;
  data[name][idx] = { ...data[name][idx], ...patch };
  writeDB(data);
  return data[name][idx];
}

async function remove(name, id) {
  const db = await connectMongo();
  if (db) {
    const col = db.collection(name);
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }
  const data = readDB();
  ensureResource(data, name);
  const idx = data[name].findIndex((i) => i.id === id);
  if (idx === -1) return false;
  data[name].splice(idx, 1);
  writeDB(data);
  return true;
}

module.exports = { all, find, create, update, remove, readDB, writeDB, connectMongo };

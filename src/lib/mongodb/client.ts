import { MongoClient, Db } from "mongodb";
import { env } from "../env";

if (!process.env.NEXT_RUNTIME) {
  throw new Error("MongoDB client must only be used in server context");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  await client.connect();

  return client;
}

export async function getDb(): Promise<Db> {
  if (!db) {
    const client = await getMongoClient();
    db = client.db(env.MONGODB_DB);
  }
  return db;
}

export async function closeMongoClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

const { MongoClient } = require('mongodb');

const localUri = "mongodb://localhost:27017/skytouchclean";

console.log('=== Testing Local MongoDB Connection ===');
console.log('Local URI:', localUri);
console.log('');

async function testLocalConnection() {
  const client = new MongoClient(localUri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    console.log('Attempting to connect to local MongoDB...');
    await client.connect();
    console.log('✓ Connected to local MongoDB successfully!');

    const db = client.db('skytouchclean');
    console.log('✓ Database accessed: skytouchclean');

    // Test if services collection exists
    const servicesCount = await db.collection('services').countDocuments();
    console.log(`✓ Services collection exists with ${servicesCount} documents`);

    // Test if service_prices collection exists
    const pricesCount = await db.collection('service_prices').countDocuments();
    console.log(`✓ Service prices collection exists with ${pricesCount} documents`);

    await client.close();
    console.log('\n✅ Local MongoDB is working!');
    console.log('💡 Recommendation: Use local MongoDB instead of Atlas for development');
    process.exit(0);
  } catch (error) {
    console.error('❌ Local MongoDB connection failed:', error.message);
    console.error('💡 Make sure local MongoDB container is running: docker start mongo');
    process.exit(1);
  }
}

testLocalConnection();

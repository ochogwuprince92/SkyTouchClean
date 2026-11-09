const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://ulokome_db_user:nlbjDVldGV9wV1H1@skytouchdb.nytllml.mongodb.net/skytouchclean";
const localUri = "mongodb://localhost:27017/skytouchclean";

console.log('Testing MongoDB connection...');
console.log('Atlas URI:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('Local URI:', localUri);
console.log('');

async function testConnection() {
  console.log('=== Testing Atlas Connection ===');
  // Try without explicit TLS (Atlas handles it automatically)
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✓ Connected successfully!');

    // Test database access
    const db = client.db('skytouchclean');
    console.log('✓ Database accessed: skytouchclean');

    // Test if services collection exists
    const servicesCount = await db.collection('services').countDocuments();
    console.log(`✓ Services collection exists with ${servicesCount} documents`);

    // Test if service_prices collection exists
    const pricesCount = await db.collection('service_prices').countDocuments();
    console.log(`✓ Service prices collection exists with ${pricesCount} documents`);

    // Test if laundry_orders collection exists
    const ordersCount = await db.collection('laundry_orders').countDocuments();
    console.log(`✓ Laundry orders collection exists with ${ordersCount} documents`);

    await client.close();
    console.log('\n✅ All tests passed! Connection is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('Error details:');
    console.error('- Name:', error.name);
    console.error('- Code:', error.code);

    if (error.message.includes('IP')) {
      console.error('\n🔍 Diagnosis: IP address not whitelisted in MongoDB Atlas');
      console.error('Solution: Add your IP to Network Access → IP Access List in Atlas');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('\n🔍 Diagnosis: SSL/TLS connection issue');
      console.error('Solution: Check if cluster is running and TLS is enabled');
    } else if (error.message.includes('auth')) {
      console.error('\n🔍 Diagnosis: Authentication failed');
      console.error('Solution: Check username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n🔍 Diagnosis: DNS resolution failed');
      console.error('Solution: Check internet connection and cluster URL');
    } else if (error.message.includes('ServerSelectionError')) {
      console.error('\n🔍 Diagnosis: Cannot connect to MongoDB server');
      console.error('Solution: Check if cluster is running and IP is whitelisted');
    }

    process.exit(1);
  }
}

testConnection();

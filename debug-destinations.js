const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'tembea-africa';

console.log('Connecting to:', uri, 'db:', dbName);

mongoose.connect(uri, { dbName: dbName })
  .then(async () => {
    console.log('Connected!');
    
    // Print all collections to see if we're in the right DB
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in DB:');
    collections.forEach(c => console.log(`- ${c.name}`));
    
    // Find all documents in 'destinations'
    const docs = await mongoose.connection.db.collection('destinations').find({}).toArray();
    console.log(`\nFound ${docs.length} documents in 'destinations' collection:`);
    
    docs.forEach((d, idx) => {
      console.log(`\nDestination #${idx + 1}:`);
      console.log(`  ID: ${d._id}`);
      console.log(`  Name: "${d.name}"`);
      console.log(`  Slug: "${d.slug}"`);
      console.log(`  Status: "${d.status}"`);
      console.log(`  isDeleted: ${d.isDeleted}`);
      console.log(`  Country: "${d.country}"`);
      console.log(`  Full doc keys:`, Object.keys(d));
    });
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
  });

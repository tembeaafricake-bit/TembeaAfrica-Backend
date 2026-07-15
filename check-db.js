const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri);

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected!');
    
    // Check destinations
    const destinations = await mongoose.connection.db.collection('destinations').find({ isDeleted: false }).toArray();
    console.log('\n--- DESTINATIONS ---');
    destinations.forEach(d => {
      console.log(`ID: ${d._id}, Name: "${d.name}", Slug: "${d.slug}", Status: "${d.status}"`);
    });
    
    // Check tours
    const tours = await mongoose.connection.db.collection('tours').find({ isDeleted: false }).toArray();
    console.log('\n--- TOURS / SAFARIS ---');
    tours.forEach(t => {
      console.log(`ID: ${t._id}, Title: "${t.title}", Slug: "${t.slug}", Destination: "${t.destination}", Status: "${t.status}"`);
    });
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
  });

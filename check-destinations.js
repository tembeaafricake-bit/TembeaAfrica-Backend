const mongoose = require('mongoose');

const uri = 'mongodb+srv://tembeaafricake_db_user:JIHcAAN0PX3YnOW1@tembeaafrica.mikpbrf.mongodb.net/?appName=TembeaAfrica';

mongoose.connect(uri, { dbName: 'tembea-africa' })
  .then(async () => {
    console.log('Connected!');
    const count = await mongoose.connection.db.collection('destinations').countDocuments();
    console.log('Total destinations in DB:', count);
    
    if (count > 0) {
      const items = await mongoose.connection.db.collection('destinations').find({}).limit(5).toArray();
      items.forEach(item => {
        console.log(`- Name: ${item.name}, Slug: ${item.slug}, Status: ${item.status}, isDeleted: ${item.isDeleted}`);
      });
    }
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('Connection error:', err);
  });

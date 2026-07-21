const mongoose = require('mongoose')

const uri = 'mongodb+srv://tembeaafricake_db_user:JIHcAAN0PX3YnOW1@tembeaafrica.mikpbrf.mongodb.net/?appName=TembeaAfrica'

async function checkToursAndDestinations() {
  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB via Mongoose')
    const db = mongoose.connection.db
    
    const tours = await db.collection('tours').find({}).toArray()
    console.log(`\nFound ${tours.length} tours:`)
    tours.forEach((tour, i) => {
      console.log(`\n--- Tour #${i + 1} ---`)
      console.log(`ID: ${tour._id}`)
      console.log(`Title: ${tour.title || tour.name}`)
      console.log(`Slug: ${tour.slug}`)
      console.log(`Destination Field: ${JSON.stringify(tour.destination)}`)
      console.log(`Category: ${tour.category}`)
      console.log(`Price: ${tour.price}`)
    })

    const destinations = await db.collection('destinations').find({}).toArray()
    console.log(`\nFound ${destinations.length} destinations:`)
    destinations.forEach((dest, i) => {
      console.log(`\n--- Destination #${i + 1} ---`)
      console.log(`ID: ${dest._id}`)
      console.log(`Name: ${dest.name}`)
      console.log(`Slug: ${dest.slug}`)
      console.log(`Country: ${dest.country}`)
      console.log(`Category: ${dest.category}`)
    })

  } catch (err) {
    console.error('Error querying MongoDB:', err)
  } finally {
    await mongoose.disconnect()
  }
}

checkToursAndDestinations()

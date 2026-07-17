import * as mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import { generateSeedData } from './seed-data'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tembea-africa'
const MONGODB_DB = process.env.MONGODB_DB || 'tembea-africa'

async function seed() {
  console.log('🌱 Connecting to:', MONGODB_URI, 'db:', MONGODB_DB)
  const conn = await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB })
  console.log('✅ Connected (mongoose)')

  if (!conn.connection.db) {
    await new Promise<void>((resolve) => conn.connection.once('open', () => resolve()))
  }
  const db = conn.connection.db

  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('destinations').deleteMany({}),
    db.collection('tours').deleteMany({}),
    db.collection('accommodations').deleteMany({}),
    db.collection('guides').deleteMany({}),
    db.collection('reviews').deleteMany({}),
    db.collection('transport').deleteMany({}),
    db.collection('transports').deleteMany({}),
  ])
  console.log('🧹 Cleared existing data')

  const seedData = await generateSeedData()

  for (const [collectionName, documents] of Object.entries(seedData.collections)) {
    if (!Array.isArray(documents) || documents.length === 0) continue
    const result = await db.collection(collectionName).insertMany(documents)
    console.log(`✅ Seeded ${result.insertedCount} ${collectionName}`)
  }

  console.log('\n🎉 Database seeded successfully!')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

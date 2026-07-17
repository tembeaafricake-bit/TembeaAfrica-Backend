"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const seed_data_1 = require("./seed-data");
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tembea-africa';
async function seed() {
    console.log('🌱 Connecting to:', MONGODB_URI);
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected (mongoose)');
    if (!conn.connection.db) {
        await new Promise((resolve) => conn.connection.once('open', () => resolve()));
    }
    const db = conn.connection.db;
    await Promise.all([
        db.collection('users').deleteMany({}),
        db.collection('destinations').deleteMany({}),
        db.collection('tours').deleteMany({}),
        db.collection('accommodations').deleteMany({}),
        db.collection('guides').deleteMany({}),
        db.collection('reviews').deleteMany({}),
        db.collection('transport').deleteMany({}),
        db.collection('transports').deleteMany({}),
    ]);
    console.log('🧹 Cleared existing data');
    const seedData = await (0, seed_data_1.generateSeedData)();
    for (const [collectionName, documents] of Object.entries(seedData.collections)) {
        if (!Array.isArray(documents) || documents.length === 0)
            continue;
        const result = await db.collection(collectionName).insertMany(documents);
        console.log(`✅ Seeded ${result.insertedCount} ${collectionName}`);
    }
    console.log('\n🎉 Database seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
}
seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map
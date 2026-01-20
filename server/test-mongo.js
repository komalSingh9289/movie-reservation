import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testURI = process.env.MONGO_URI;
console.log('Testing connection to:', testURI.split('@')[1]); // Don't log credentials

const testConnection = async () => {
    try {
        await mongoose.connect(testURI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ FAILURE: Connection failed');
        console.error(error);
        process.exit(1);
    }
};

testConnection();

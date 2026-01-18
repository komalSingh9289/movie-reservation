
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SeatLayout from './src/models/seatLayout.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const data = {
            name: "STANDARD_100",
            rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
            cols: 10,
            seatTypes: {
                A: "PLATINUM",
                B: "PLATINUM",
                C: "GOLD",
                D: "GOLD",
                E: "GOLD",
                F: "SILVER",
                G: "SILVER",
                H: "SILVER",
                I: "SILVER",
                J: "SILVER"
            }
        };

        // Check if it already exists
        const existing = await SeatLayout.findOne({ name: data.name });
        if (existing) {
            console.log('Seat layout STANDARD_100 already exists. Skipping...');
        } else {
            await SeatLayout.create(data);
            console.log('Successfully seeded STANDARD_100 seat layout!');
        }

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();

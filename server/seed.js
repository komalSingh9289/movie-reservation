import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './src/models/movies.js';
import Category from './src/models/category.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Category.deleteMany({});
        await Movie.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create categories
        const categories = await Category.insertMany([
            { name: 'Action', description: 'High-octane action movies' },
            { name: 'Drama', description: 'Dramatic storytelling' },
            { name: 'Comedy', description: 'Laugh-out-loud comedies' },
            { name: 'Thriller', description: 'Edge-of-your-seat thrillers' },
            { name: 'Sci-Fi', description: 'Science fiction adventures' },
            { name: 'Horror', description: 'Scary horror films' },
            { name: 'Romance', description: 'Romantic movies' },
        ]);
        console.log('✅ Created categories');

        // Create sample movies
        const movies = await Movie.insertMany([
            {
                title: 'The Dark Knight',
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                language: 'English',
                releaseDate: new Date('2008-07-18'),
                duration: '2h 32m',
                category: categories.find(c => c.name === 'Action')._id,
                isActive: true,
            },
            {
                title: 'Inception',
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                language: 'English',
                releaseDate: new Date('2010-07-16'),
                duration: '2h 28m',
                category: categories.find(c => c.name === 'Sci-Fi')._id,
                isActive: true,
            },
            {
                title: 'The Shawshank Redemption',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                language: 'English',
                releaseDate: new Date('1994-09-23'),
                duration: '2h 22m',
                category: categories.find(c => c.name === 'Drama')._id,
                isActive: true,
            },
            {
                title: 'Pulp Fiction',
                description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
                poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                language: 'English',
                releaseDate: new Date('1994-10-14'),
                duration: '2h 34m',
                category: categories.find(c => c.name === 'Thriller')._id,
                isActive: true,
            },
            {
                title: 'Forrest Gump',
                description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
                poster: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
                language: 'English',
                releaseDate: new Date('1994-07-06'),
                duration: '2h 22m',
                category: categories.find(c => c.name === 'Drama')._id,
                isActive: true,
            },
            {
                title: 'The Matrix',
                description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                language: 'English',
                releaseDate: new Date('1999-03-31'),
                duration: '2h 16m',
                category: categories.find(c => c.name === 'Sci-Fi')._id,
                isActive: true,
            },
            {
                title: 'Interstellar',
                description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                language: 'English',
                releaseDate: new Date('2014-11-07'),
                duration: '2h 49m',
                category: categories.find(c => c.name === 'Sci-Fi')._id,
                isActive: true,
            },
            {
                title: 'The Godfather',
                description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
                poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                language: 'English',
                releaseDate: new Date('1972-03-24'),
                duration: '2h 55m',
                category: categories.find(c => c.name === 'Drama')._id,
                isActive: true,
            },
        ]);
        console.log(`✅ Created ${movies.length} movies`);

        console.log('\n🎉 Database seeded successfully!');
        console.log(`   - ${categories.length} categories`);
        console.log(`   - ${movies.length} movies`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();

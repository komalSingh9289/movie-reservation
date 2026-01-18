import Movie from "../models/movies.js";
import Show from "../models/show.js";

export const createMovie = async (req, res) => {
    try {
        if (req.dbUser.role !== "super_admin") {
            return res.status(403).json({ message: "Only super admins can create global movies" });
        }

        const { title, description, poster, duration, language, releaseDate, category } = req.body;

        const movie = await Movie.create({
            title,
            description,
            poster,
            duration,
            language,
            releaseDate: new Date(releaseDate),
            category
        });

        res.status(201).json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMovies = async (req, res) => {
    try {
        const { showingOnly } = req.query;

        if (showingOnly === "true") {
            const today = new Date().toISOString().split('T')[0];
            const movieIdsWithShows = await Show.distinct("movie");

            const movies = await Movie.find({
                _id: { $in: movieIdsWithShows },
                isActive: true
            }).populate("category").sort({ createdAt: -1 });

            return res.json(movies);
        }

        const movies = await Movie.find({ isActive: true }).populate("category").sort({ createdAt: -1 });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).populate("category");
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: "Invalid movie ID" });
    }
};

export const updateMovie = async (req, res) => {
    try {
        if (req.dbUser.role !== "super_admin") {
            return res.status(403).json({ message: "Only super admins can update movies" });
        }

        const { title, description, poster, duration, language, releaseDate, category } = req.body;

        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, description, poster, duration, language, releaseDate, category },
            { new: true }
        );

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.json(movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMovie = async (req, res) => {
    try {
        if (req.dbUser.role !== "super_admin") {
            return res.status(403).json({ message: "Only super admins can delete movies" });
        }

        const movie = await Movie.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.json({ message: "Movie deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

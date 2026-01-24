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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        let query = { isActive: true };

        if (showingOnly === "true") {
            const movieIdsWithShows = await Show.distinct("movie");
            query._id = { $in: movieIdsWithShows };
        }

        const total = await Movie.countDocuments(query);
        const movies = await Movie.find(query)
            .populate("category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            movies,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMovies: total
        });
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

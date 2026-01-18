import OrganizationMovie from "../models/organizationMovie.js";
import User from "../models/user.js";

export const addMovieToOrganization = async (req, res) => {
    try {
        const { movieId } = req.body;
        const organizationId = req.dbUser.organizationId;

        if (!organizationId) {
            return res.status(400).json({ message: "User is not associated with an organization" });
        }

        const orgMovie = await OrganizationMovie.create({
            organizationId,
            movieId,
        });

        res.status(201).json(orgMovie);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Movie already in organization collection" });
        }
        res.status(500).json({ message: error.message });
    }
};

export const getOrganizationMovies = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });

        if (!user || (!user.organizationId && user.role !== 'super_admin')) {
            return res.status(400).json({ message: "Invalid organization state" });
        }

        let query = {};
        if (user.role === 'admin') {
            query.organizationId = user.organizationId;
        } else if (user.role === 'super_admin' && req.query.organizationId) {
            query.organizationId = req.query.organizationId;
        }

        const movies = await OrganizationMovie.find(query)
            .populate("movieId")
            .sort({ createdAt: -1 });

        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

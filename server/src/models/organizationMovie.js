import mongoose from "mongoose";

const organizationMovieSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate movie assignments per organization
organizationMovieSchema.index({ organizationId: 1, movieId: 1 }, { unique: true });

const OrganizationMovie = mongoose.model("OrganizationMovie", organizationMovieSchema);

export default OrganizationMovie;

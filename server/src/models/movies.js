import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;

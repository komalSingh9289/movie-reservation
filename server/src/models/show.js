import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "locked", "booked"],
      default: "available",
    },
    lockedBy: {
      type: String, // socketId or userId
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD (simple for now)
      required: true,
    },
    time: {
      type: String, // HH:mm
      required: true,
    },
    seats: [seatSchema],
    price: {
      type: Number,
      required: true,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);

export default Show;

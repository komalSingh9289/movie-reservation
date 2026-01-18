import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "LOCKED", "BOOKED"],
      default: "AVAILABLE",
    },
    type: {
      type: String,
      enum: ["PLATINUM", "GOLD", "SILVER"],
      default: "SILVER",
    },
    lockedBy: {
      type: String, // userId or socketId
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
      type: String, // YYYY-MM-DD
      required: true,
    },

    time: {
      type: String, // HH:mm
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },

    screenId: {
      type: mongoose.Schema.Types.ObjectId, // embedded screen _id
      required: true,
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    seats: [seatSchema],
  },
  { timestamps: true }
);

// 🔥 Performance & safety
showSchema.index({ movie: 1, date: 1 });
showSchema.index({ theater: 1 });
showSchema.index({ organization: 1 });

export default mongoose.model("Show", showSchema);

import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    layoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeatLayout",
      required: true,
    }
  },
  { _id: true } // important
);

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
    },

    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true, // 🔒 1 theatre per org
    },

    // optional, mostly for audit/logs
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    screens: [screenSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Theater", theaterSchema);

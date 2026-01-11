import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    name: String,
    email: String,
    avatar: String,

    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
    },

    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      default: null,
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],

    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

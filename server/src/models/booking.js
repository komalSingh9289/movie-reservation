import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk userId
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: [
      {
        type: String, // ["A1", "A2"]
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;

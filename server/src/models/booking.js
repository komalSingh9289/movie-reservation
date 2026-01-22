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
    orderId: {
      type: String,
      unique: true,
    },
    cfOrderId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String, // Cashfree specific status (PAID, ACTIVE, etc)
    },
    paymentMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;

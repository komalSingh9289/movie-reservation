import mongoose from "mongoose";

const SeatLayoutSchema = new mongoose.Schema({
  name: { type: String, required: true }, // STANDARD_100
  rows: [String], // ["A","B","C","D","E","F","G","H","I","J"]
  cols: { type: Number, required: true }, // 10

  seatTypes: {
    type: Map,
    of: String // A → GOLD, B → GOLD ...
  }
});

export default mongoose.model("SeatLayout", SeatLayoutSchema);

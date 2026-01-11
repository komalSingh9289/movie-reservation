import mongoose from "mongoose";

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
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        description: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Theater", theaterSchema);

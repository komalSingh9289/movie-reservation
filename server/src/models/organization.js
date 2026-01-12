import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One admin per organization
        },
        theaterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theater",
            unique: true, // One theater per organization
        },
    },
    { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);

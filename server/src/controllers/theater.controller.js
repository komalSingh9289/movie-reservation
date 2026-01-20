import Theater from "../models/theater.js";
import User from "../models/user.js";
import Organization from "../models/organization.js";
import seatLayout from "../models/seatLayout.js";

export const registerTheater = async (req, res) => {
    const { name, location, description, organizationName, organizationDescription } = req.body;
    const clerkId = req.auth.userId;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "user") {
            return res.status(400).json({ message: "User already has an administrative role" });
        }

        // Create Organization first
        const organization = await Organization.create({
            name: organizationName || `${name} Organization`,
            description: organizationDescription || `Organization for ${name}`,
            adminId: user._id,
        });

        //adding layout 
        const defaultLayout = await seatLayout.findOne({ name: "STANDARD_100" });

        if (!defaultLayout) {
            return res.status(500).json({
                message: "Default seat layout not found. Please run 'node seed_seat_layout.js' to initialize seat layouts."
            });
        }

        const screensWithLayout = req.body.screens.map(screen => ({
            ...screen,
            layoutId: defaultLayout._id
        }));


        // Create Theater linked to Organization
        const theater = await Theater.create({
            name,
            location,
            description,
            ownerId: user._id,
            organizationId: organization._id,
            screens: screensWithLayout || [],

        });

        // Update Organization with theaterId
        organization.theaterId = theater._id;
        await organization.save();

        // Update User with role and organizationId
        user.role = "admin";
        user.theaterId = theater._id;
        user.organizationId = organization._id;
        await user.save();

        res.status(201).json({ theater, organization, user });
    } catch (error) {
        console.error("Error registering theater and organization:", error);
        res.status(500).json({ message: "Error registering theater and organization", error: error.message });
    }
};

export const getAllTheaters = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });
        if (!user || user.role !== 'super_admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const theaters = await Theater.find().populate('ownerId', 'name email');
        res.json(theaters);
    } catch (error) {
        res.status(500).json({ message: "Error fetching theaters" });
    }
};

export const getMe = async (req, res) => {
    const clerkId = req.auth.userId;

    try {
        const user = await User.findOne({ clerkId });
        let theaterId = user.theaterId;

        // Fallback: If theaterId is missing, look up Organization by adminId
        if (!theaterId) {
            const org = await Organization.findOne({ adminId: user._id });
            if (org) {
                theaterId = org.theaterId;
            }
        }

        if (!theaterId) {
            return res.status(404).json({ message: "Theater not found" });
        }

        const theater = await Theater.findById(theaterId).populate("organizationId");
        res.json(theater);
    } catch (error) {
        console.error("Error fetching theater/organization details:", error);
        res.status(500).json({ message: "Error fetching details" });
    }
};

export const updateMe = async (req, res) => {
    const { name, location, description, organizationName, organizationDescription, screens } = req.body;
    const clerkId = req.auth.userId;

    try {
        const user = await User.findOne({ clerkId });
        let { organizationId, theaterId } = user;

        if (!organizationId || !theaterId) {
            const org = await Organization.findOne({ adminId: user._id });
            if (org) {
                organizationId = org._id;
                theaterId = org.theaterId;
            }
        }

        if (!organizationId || !theaterId) {
            return res.status(404).json({ message: "Admin organization or theater not found" });
        }

        // Update Theater
        const theater = await Theater.findByIdAndUpdate(
            theaterId,
            { name, location, description, screens },
            { new: true }
        );

        // Update Organization
        const organization = await Organization.findByIdAndUpdate(
            organizationId,
            { name: organizationName, description: organizationDescription },
            { new: true }
        );

        res.json({ theater, organization });
    } catch (error) {
        console.error("Error updating theater/organization:", error);
        res.status(500).json({ message: "Error updating details", error: error.message });
    }
};

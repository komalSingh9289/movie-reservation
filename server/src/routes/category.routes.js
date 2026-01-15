import express from "express";
import Category from "../models/category.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 */
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 */
router.post("/", isAdmin, async (req, res) => {
    try {
        if (req.dbUser.role !== "super_admin") {
            return res.status(403).json({ message: "Only super admins can manage categories" });
        }

        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 */
router.put("/:id", isAdmin, async (req, res) => {
    try {
        if (req.dbUser.role !== "super_admin") {
            return res.status(403).json({ message: "Only super admins can manage categories" });
        }

        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 */
router.delete("/:id", isAdmin, async (req, res) => {
    try {
        if (req.dbUser.role !== "super_admin") {
            return res.status(403).json({ message: "Only super admins can manage categories" });
        }
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

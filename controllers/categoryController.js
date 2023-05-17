const Category = require("../models/categoryModel");

// Get All Categories Controller

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            parentCategory: null,
        }).populate("subcategories");
        res.send(categories);
    } catch (error) {
        res.status(500).send(error);
    }
};
// get single category
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Category Not Found" });
        }
        res.send(category);
    } catch (error) {
        res.status(500).send(error);
    }
};
// create a category
exports.createCategory = async (req, res) => {
    try {
        const { name, parentCategory } = req.body;
        const slug = name.toLowerCase().replace(/ /g, "-");

        // Check if the category already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const category = new Category({
            name,
            slug,
            parentCategory,
        });

        await category.save();

        if (parentCategory) {
            await Category.findByIdAndUpdate(parentCategory, {
                $push: { subcategories: category._id },
            });
        }

        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update Category Controller
exports.updateCategory = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "slug", "parentCategory", "subcategories"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send();
        }

        updates.forEach((update) => (category[update] = req.body[update]));
        await category.save();
        res.send(category);
    } catch (error) {
        res.status(400).send(error);
    }
};
// Delete Category Controller
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send();
        }

        // Remove the category from its parent category's subcategories list
        if (category.parentCategory) {
            await Category.findByIdAndUpdate(category.parentCategory, {
                $pull: { subcategories: category._id },
            });
        }

        await category.remove();

        res.send(category);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get Subcategories Controller
exports.getSubcategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send();
        }
        const subcategories = await Category.find({ parentCategory: category._id });
        res.send(subcategories);
    } catch (error) {
        res.status(500).send(error);
    }
};

// create a subcategory
exports.createSubcategory = async (req, res) => {
    try {
        const { parentId, name, slug } = req.body;

        if (!parentId || !name || !slug) {
            return res.status(400).json({
                error: "Parent category ID, subcategory name, and slug are required.",
            });
        }

        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
            return res.status(404).json({ error: "Parent category not found." });
        }

        const newSubcategory = new Category({
            name,
            slug,
            parentCategory: parentId,
        });
        const savedSubcategory = await newSubcategory.save();

        parentCategory.subcategories.push(savedSubcategory._id);
        await parentCategory.save();

        res.status(201).json(savedSubcategory);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};
// delete a subcategory
exports.deleteSubcategory = async (req, res) => {
    try {
        const parentCategory = await Category.findById(req.params.parentId);
        if (!parentCategory) {
            return res.status(404).send();
        }
        const subcategoryId = req.params.subcategoryId;
        const subcategoryIndex =
            parentCategory.subcategories.indexOf(subcategoryId);
        if (subcategoryIndex === -1) {
            return res.status(404).send();
        }
        parentCategory.subcategories.splice(subcategoryIndex, 1);
        await Category.findByIdAndDelete(subcategoryId);
        await parentCategory.save();
        res.send(parentCategory);
    } catch (error) {
        res.status(500).send(error);
    }
};
exports.getCategoriesWithSubcategories = async (req, res) => {
    try {
        const topLevelCategories = await Category.find({
            parentCategory: null,
        }).populate("subcategories");
        const categoriesWithSubcategories = await Promise.all(
            topLevelCategories.map(async (topLevelCategory) => {
                const subcategories = await Promise.all(
                    topLevelCategory.subcategories.map(async (subcategoryId) => {
                        const subcategory = await Category.findById(subcategoryId).populate(
                            "subcategories"
                        );
                        return subcategory;
                    })
                );
                return { ...topLevelCategory._doc, subcategories };
            })
        );
        res.status(200).json(categoriesWithSubcategories);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

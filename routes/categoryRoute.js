// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
// categories controllers
router.get("/categories", categoryController.getCategories);
router.get("/categories/:id", categoryController.getCategory);
router.post("/categories", categoryController.createCategory);
router.delete("/categories/:id", categoryController.deleteCategory);
router.patch("/categories/:id", categoryController.updateCategory);
// subcategories controller
router.get("/categories/:id/subcategories", categoryController.getSubcategory);
router.post(
    "/categories/:id/subcategories",
    categoryController.createSubcategory
);
router.delete(
    "/categories/:id/subcategories",
    categoryController.deleteSubcategory
);
router.get(
    "/categories-with-subcategories",
    categoryController.getCategoriesWithSubcategories
);
// ... other routes

module.exports = router;

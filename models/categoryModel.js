const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
});
module.exports = mongoose.model("Category", categorySchema);

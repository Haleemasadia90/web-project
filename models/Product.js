// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  subSubCategory: { type: String },
  sizes: [{ type: String }], // array of sizes
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String },
});

module.exports = mongoose.model("Product", ProductSchema);

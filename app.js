const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Models
const User = require("./models/User");
const Order = require("./models/Order");
const Product = require("./models/Product"); // fixed typo here
const Contact = require("./models/Contact");
const Newsletter = require("./models/Subscriber");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------- Middleware ----------------
app.use(cors());
app.use(express.json());

// ---------------- MongoDB Connection ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ---------------- Test Route ----------------
app.get("/", (req, res) => res.send("NEXAWEAR Backend Running"));

// ---------------- REGISTER ----------------
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: "Registration successful" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- LOGIN ----------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- PRODUCTS ----------------

// Get all products or filter by query
app.get("/api/products", async (req, res) => {
  try {
    const { query } = req.query; // optional search query
    let products;

    if (query) {
      const regex = new RegExp(query, "i"); // case-insensitive
      products = await Product.find({
        $or: [
          { name: regex },
          { category: regex },
          { subCategory: regex },
          { subSubCategory: regex },
          { description: regex },
          { color: regex },
          { sizes: regex }, // array
          { price: regex },
        ],
      });
    } else {
      products = await Product.find();
    }

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new product (Admin)
app.post("/api/products", async (req, res) => {
  try {
    const { name, gender, category, subCategory, subSubCategory, sizes, price, stock, image } = req.body;
    const newProduct = new Product({ name, gender, category, subCategory, subSubCategory, sizes, price, stock, image });
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Update product stock (Admin)
app.put("/api/products/:id", async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.json({ message: "Stock updated", product });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a product (Admin)
app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- ORDERS ----------------
app.post("/api/order", async (req, res) => {
  try {
    const { cartItems, formData, totalPrice, shippingCost, tax, discount } = req.body;

    // Reduce stock for each product
    for (let item of cartItems) {
      const product = await Product.findById(item.id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product?.name || "Unknown Product"}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Save order
    const order = new Order({ formData, cartItems, totalPrice, shippingCost, tax, discount });
    await order.save();

    res.status(201).json({ message: "Order placed and stock updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

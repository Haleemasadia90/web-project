const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// POST /api/newsletter
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already subscribed" });

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    console.log("📩 New Newsletter Subscriber:", subscriber);

    res.json({ message: "Subscribed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

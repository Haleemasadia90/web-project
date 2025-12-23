const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    console.log("📩 New Contact Message:", contact);

    res.json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Item = require('./models/Item');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- API ROUTES ---

// 1. Fetch all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Add a new item
app.post('/api/items', async (req, res) => {
  const { name, price, unit } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ message: "Please provide both name and price." });
  }

  try {
    const newItem = new Item({ name, price, unit });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This item already exists in your list!" });
    }
    res.status(500).json({ message: err.message });
  }
});

// 3. Update an item's rate
app.put('/api/items/:id', async (req, res) => {
  const { price } = req.body;
  
  if (price === undefined || price === null) {
    return res.status(400).json({ message: "Price value is required." });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id, 
      { price }, 
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found." });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Delete an item from the list
app.delete('/api/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found." });
    }
    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
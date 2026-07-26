const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "h.html"));
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("Database connection error:", err));

// Define Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  items: { type: String, required: true },
  total: { type: String, required: true },
  status: { type: String, default: "Pending", enum: ["Pending", "Completed"] },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// --- API ROUTES ---

// 1. Get all orders (Used by Admin view)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// 2. Place a new order (Used by Customer view)
app.post("/api/orders", async (req, res) => {
  try {
    const { items, total } = req.body;

    // Generate a random ID like #5342
    const uniqueId = "#" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = new Order({
      orderId: uniqueId,
      items,
      total,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: "Error creating order"});
  }
});

// 3. Update order status to Completed (Used by Admin view)
app.patch("/api/orders/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true },
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Error updating order status", error });
  }
});

// 4. Clear all orders (Used by Admin view)
app.delete("/api/orders", async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: "All order histories deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error clearing orders", error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

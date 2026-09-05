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

const verifyAdminKey = (req, res, next) => {
  const incomingKey = req.headers["x-api-key"];
  const expectedKey = process.env.API_Key || "Mzilikazikamashobane@574";

  console.log("---AUTH DEBUG---");
  console.log("Incoming API Key:", incomingKey);
  console.log("Expected API Key:", expectedKey);

  if (incomingKey && incomingKey === expectedKey) {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized access" });
  }
};

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
app.get("/api/orders", verifyAdminKey, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { items, total } = req.body;

    const uniqueId = "#" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = new Order({
      orderId: uniqueId,
      items,
      total,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: "Error creating order" });
  }
});

app.patch("/api/orders/:id/status", verifyAdminKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Received status update: ", { id, status });
    const formattedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const validStatuses = ["Pending", "Complete", "Cancel"];
    if (!validStatuses.includes(formattedStatus)) {
      console.log("Status validation failed for:", formattedStatus);
      return res.status(400).json({ message: "invalid status value" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: formattedStatus },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status", error });
  }
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "admin.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "ekhoneni.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

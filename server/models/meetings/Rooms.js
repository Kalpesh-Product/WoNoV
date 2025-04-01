const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  status: {
    type: String,
    default: "Available",
    enum: ["Available", "Occupied", "Cleaning"],
  },
  name: {
    type: String,
    required: true,
  },
  seats: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1462826303086-329426d1aef5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    id: String,
  },
  housekeepingStatus: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
  },
  assignedAssets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
  ],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;

const mongoose = require("mongoose");

const clientEvents = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoworkingClient",
  },
  eventName: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    enum: ["Holiday", "Event"],
  },
  description: {
    type: String,
  },
  fromDate: {
    type: Date,
  },
  toDate: {
    type: Date,
  },
});

const ClientEvents = mongoose.model("ClientEvent", clientEvents);
module.exports = ClientEvents;

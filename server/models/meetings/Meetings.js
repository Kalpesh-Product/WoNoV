const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    bookedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    meetingType: {
      type: String,
      enum: ["Internal", "External"],
      required: true,
    },
    internalParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
      },
    ],
    externalParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor",
      },
    ],
    agenda: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Upcoming",
      enum: ["Upcoming", "Ongoing", "Completed", "Extended", "Cancelled"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    location: {
      type: String,
    },
    housekeepingChecklist: [
      {
        name: {
          type: String,
        },
      },
    ],
    houeskeepingStatus: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);
module.exports = Meeting;

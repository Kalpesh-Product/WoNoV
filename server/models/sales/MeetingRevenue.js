const mongoose = require("mongoose");

const meetingClientRevenueSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    client: {
      type: String,
      // required: true,
    },
    particulars: {
      type: String,
      required: true,
    },
    unitsOrHours: {
      type: String,
      // required: true,
    },
    hoursBooked: {
      type: String,
      // required: true,
    },
    // meetingRoomName: {
    //   type: String,
    //   required: true,
    // },
    costPerHour: {
      type: Number,
      // required: true,
    },
    //field added in bulk upload
    meetingRoomName: {
      type: String,
      // required: true,
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
    },
    taxable: {
      type: Number,
      // required: true,
    },
    gst: {
      type: Number,
      // required: true,
    },
    totalAmount: {
      type: Number,
      // required: true,
    },
    paymentDate: {
      type: Date,
      // required: false,
    },
    status: {
      type: String,
    },
    remarks: {
      type: String,
      // required: false,
    },
  },
  {
    timestamps: true,
  },
);

const MeetingRevenue = mongoose.model(
  "MeetingClientRevenue",
  meetingClientRevenueSchema,
);
module.exports = MeetingRevenue;

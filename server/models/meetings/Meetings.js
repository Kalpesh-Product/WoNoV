const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    clientBookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingMember",
    },
    receptionist: {
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
    extendTime: {
      type: Date,
    },
    meetingType: {
      type: String,
      enum: ["Internal", "External"],
      required: true,
    },
    creditsUsed: {
      type: Number,
    },
    paymentAmount: {
      type: Number,
    },
    paymentStatus: {
      type: Boolean,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Cheque", "NEFT", "RTGS", "IMPS", "Credit Card", "ETC"],
    },
    paymentProof: {
      link: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    paymentVerification: {
      type: String,
      enum: ["Under Review", "Verified"],
      default: "Under Review",
    },
    internalParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
      },
    ],
    clientParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoworkingMember",
      },
    ],
    // externalParticipants: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Visitor",
    //   },
    // ],
    externalParticipants: [
      {
        name: {
          type: String,
        },
        mobileNumber: {
          type: String,
        },
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
    reason: {
      //reason for cancelling meeting
      type: String,
    },
    status: {
      type: String,
      default: "Upcoming",
      enum: ["Upcoming", "Ongoing", "Completed", "Extended", "Cancelled"],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient",
    },
    externalClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
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
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);
module.exports = Meeting;

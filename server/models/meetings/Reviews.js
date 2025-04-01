const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewerName: {
      type: String,
      required: true,
    },
    reviewerEmail:{
      type: String,
      required: true,
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
    },
    review: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    reply: {
      replierName: {
        type: String,
      },
      replierEmail:{
        type: String,
      }, 
      text: {
        type:String
      }
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

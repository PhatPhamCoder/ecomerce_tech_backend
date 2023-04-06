const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your event name!"],
    },
    description: {
      type: String,
      required: [true, "Please enter your event name!"],
    },
    category: {
      type: String,
      required: [true, "Please enter your event name!"],
    },
    start_date: {
      type: Date,
      required: true,
    },
    Finish_Date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "Running",
    },
    tags: {
      type: String,
    },
    originalPrice: {
      type: Number,
    },
    discountPrice: {
      type: Number,
      required: [true, "Please enter your event product price!"],
    },
    discountPrice: {
      type: Number,
      required: [true, "Please enter your event product price!"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter your stock!"],
    },
    images: [
      {
        type: String,
      },
    ],
    shopId: {
      type: String,
      required: true,
    },
    shop: {
      type: Object,
      required: true,
    },
    sold_out: {
      type: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);

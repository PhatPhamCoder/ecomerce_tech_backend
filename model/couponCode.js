const mongoose = require("mongoose");

const coupounCodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your coupoun code name!"],
      unique: true,
    },
    value: {
      type: Number,
      required: true,
    },
    minAmount: {
      type: Number,
    },
    maxAmount: {
      type: Number,
    },
    shop: {
      type: String,
      required: true,
    },
    selectedProducts: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CouponCode", coupounCodeSchema);

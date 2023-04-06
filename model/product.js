const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your product name!"],
    },
    description: {
      type: String,
      required: [true, "Please enter your product name!"],
    },
    category: {
      type: String,
      required: [true, "Please enter your product name!"],
    },
    tags: {
      type: String,
    },
    originalPrice: {
      type: Number,
    },
    discountPrice: {
      type: Number,
      required: [true, "Please enter your Product price!"],
    },
    discountPrice: {
      type: Number,
      required: [true, "Please enter your Product price!"],
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

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
    },
    headline: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
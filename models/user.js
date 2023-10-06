const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Поле name является обязательным"],
      minlength: [2, "Минимальная длина 2 символа"],
      maxlength: [30, "Максимальная длина 30 символов"],
    },
    about: {
      type: String,
      required: [true, "Поле name является обязательным"],
      minlength: [2, "Минимальная длина 2 символа"],
      maxlength: [30, "Максимальная длина 30 символов"],
    },
    avatar: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true },
);

module.exports = mongoose.model("user", userSchema);

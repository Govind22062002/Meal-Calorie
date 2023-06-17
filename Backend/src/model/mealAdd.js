const { time } = require("console");
const mongoose = require("mongoose")

const mealSchema = mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    meal: [
      {
        mealTime: String,
        mealName: String,
        quantity: String,
        calories: String,
        protein: String,
        carbs: String,
        fat: String,
        time: Date,
      },
    ],
  },
  { timestamps: true }
);

const meal = mongoose.model("meal", mealSchema);

module.exports = meal;
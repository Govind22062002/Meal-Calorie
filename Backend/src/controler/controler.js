const user = require("../model/users");
const meal = require("../model/mealAdd");
const mongoose = require("mongoose");
const request = require("request");
const axios = require("axios");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await user.findOne({ email });
    if (data) {
      if (password === data.password) {
         res.status(200).send({ message: "Login successfull", data });
      } else {
         res.status(200).send({ message: "password incorrect" });
      }
    } else {
       res.status(200).send({ message: "user not registerd" });
    }
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const finduser = await user.findOne({ email });
    if (finduser) {
      res.send({ message: "user already registerd" });
    } else {
       await user.create({
        name,
        email,
        password,
      });
      res.status(200).send({ message: "successfully registerd, Please Login now. " });
    }
  } catch (error) {
    console.log(error);
  }
};

const addMeal = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const data = req.body;

    const dataArray = [];

    dataArray.push({
      mealTime: "Breakfast",
      mealName: data.breakFastMeal,
      quantity: data.breakFastQty,
    });

    dataArray.push({
      mealTime: "Lunch",
      mealName: data.lunchMeal,
      quantity: data.lunchQty,
    });

    dataArray.push({
      mealTime: "Dinner",
      mealName: data.dinnerMeal,
      quantity: data.dinnerQty,
    });

    console.log(dataArray);
    async function storeDataInDatabase(data, res) {
      for (const item of data) {
        const query = `${item.quantity} ${item.mealName}`;
        const apiUrl = `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(
          query
        )}`;
        const headers = {
          "X-Api-Key": "l/RmsBK7sPmqX43xtNGzlg==Ewvtmgm1ihN7XyFM",
        };

        try {
          const response = await axios.get(apiUrl, { headers });
          const nutrition = response.data;

          if (nutrition.length > 0) {
            const calories = ~~nutrition[0].calories;
            const protein = ~~nutrition[0].protein_g;
            const carbs = ~~nutrition[0].carbohydrates_total_g;
            const fat = ~~nutrition[0].fat_total_g;
            const time = new Date();

            const user = await meal.findOne({ userId });
            if (user) {
              await meal.findOneAndUpdate(
                { userId },
                {
                  $push: {
                    meal: {
                      mealTime: item.mealTime,
                      mealName: item.mealName,
                      quantity: item.quantity,
                      calories,
                      protein,
                      carbs,
                      fat,
                      time,
                    },
                  },
                }
              );
            } else {
              await meal.create({
                userId,
                meal: [
                  {
                    mealTime: item.mealTime,
                    mealName: item.mealName,
                    quantity: item.quantity,
                    calories,
                    protein,
                    carbs,
                    fat,
                    time,
                  },
                ],
              });
            }
            console.log(`Data stored for ${item.mealTime}: ${item.mealName}`);
          } else {
            console.log(
              `No nutrition data found for ${item.mealTime}: ${item.mealName}`
            );
          }
        } catch (error) {
          console.error(
            `Error occurred while making API request for ${item.mealTime}: ${item.mealName}`
          );
          console.error(error);

          // Send an error response to the client
          return res
            .status(500)
            .json({ error: "An error occurred while processing the data." });
        }
      }
      return res.json({ message: "Data stored successfully." });
    }
    storeDataInDatabase(dataArray, res);

    //
  } catch (error) {
    console.log(error);
  }
};

const totalData = async (req, res) => {
  try {
    const data = await meal.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $facet: {
          data: [
            {
              $match: {
                "meal.time": {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
            {
              $unwind: "$meal",
            },
            {
              $match: {
                "meal.time": {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
            {
              $group: {
                _id: "$meal.mealTime",
                protein: { $sum: { $toDouble: "$meal.protien" } },
                carbs: { $sum: { $toDouble: "$meal.carbs" } },
                fats: { $sum: { $toDouble: "$meal.fat" } },
              },
            },
            {
              $project: {
                _id: 0,
                name: "$_id",
                protein: 1,
                carbs: 1,
                fats: 1,
              },
            },
          ],
          totalCalories: [
            {
              $unwind: "$meal",
            },
            {
              $group: {
                _id: null,
                todayCalories: {
                  $sum: {
                    $cond: [
                      {
                        $gte: [
                          "$meal.time",
                          new Date(new Date().setHours(0, 0, 0, 0)),
                        ],
                      },
                      { $toDouble: "$meal.calories" },
                      0,
                    ],
                  },
                },
                thisWeekCalories: {
                  $sum: {
                    $cond: [
                      {
                        $gte: [
                          "$meal.time",
                          {
                            $dateFromParts: {
                              isoWeekYear: { $isoWeekYear: "$meal.time" },
                              isoWeek: { $isoWeek: "$meal.time" },
                              isoDayOfWeek: 1,
                            },
                          },
                        ],
                      },
                      { $toDouble: "$meal.calories" },
                      0,
                    ],
                  },
                },
                thisMonthCalories: {
                  $sum: {
                    $cond: [
                      {
                        $gte: [
                          "$meal.time",
                          {
                            $dateFromParts: {
                              year: { $year: "$meal.time" },
                              month: { $month: "$meal.time" },
                              day: 1,
                            },
                          },
                        ],
                      },
                      { $toDouble: "$meal.calories" },
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                todayCalories: 1,
                thisWeekCalories: 1,
                thisMonthCalories: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          data: 1,
          totalCalories: { $arrayElemAt: ["$totalCalories", 0] },
        },
      },
      {
        $group: {
          _id: null,
          todayCalories: { $sum: "$totalCalories.todayCalories" },
          thisWeekCalories: { $sum: "$totalCalories.thisWeekCalories" },
          thisMonthCalories: { $sum: "$totalCalories.thisMonthCalories" },
          data: { $push: "$data" },
        },
      },
      {
        $project: {
          _id: 0,
          todayCalories: 1,
          thisWeekCalories: 1,
          thisMonthCalories: 1,
          data: {
            $reduce: {
              input: "$data",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);

    const todayData = await meal.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $unwind: {
          path: "$meal",
        },
      },
      {
        $match: {
          "meal.time": {
            $gte: new Date("Mon, 12 Jun 2023 18:30:00 GMT"),
          },
        },
      },
      {
        $group: {
          _id: "$meal.mealTime",
          mealNames: {
            $push: "$meal.mealName",
          },
          quantities: {
            $push: {
              $toString: "$meal.quantity",
            },
          },
          mealId: {
            $push: "$meal._id",
          },
        },
      },
      {
        $project: {
          _id: 0,
          mealType: "$_id",
          mealNames: 1,
          quantities: 1,
          mealId: 1,
        },
      },
      {
        $sort: {
          mealType: 1,
        },
      },
    ]);

    res.status(200).send({ data, todayData });
  } catch (error) {
    console.log(error);
  }
};

const deleteMeal = async (req, res) => {
  try {
    const deleteId = await meal.updateMany(
      {},
      { $pull: { meal: { _id: req.params.mealId } } }
    );
    res.status(200).send({ message: "meal is delete successfully " });
  } catch (error) {
    console.log(error);
  }
};

const updateMeal = async (req, res) => {
  try {
    const { id, mealName, mealTime, quantity } = req.body;

    var query = `${quantity} ${mealName}`;
    request.get(
      {
        url: "https://api.api-ninjas.com/v1/nutrition?query=" + query,
        headers: {
          "X-Api-Key": "l/RmsBK7sPmqX43xtNGzlg==Ewvtmgm1ihN7XyFM",
        },
      },
      async function (error, response, body) {
        if (error) return console.error("Request failed:", error);
        else if (response.statusCode != 200)
          return console.error(
            "Error:",
            response.statusCode,
            body.toString("utf8")
          );
        else {
          const nutrition = JSON.parse(body);
          if (nutrition[0]) {
            await meal.updateOne(
              { "meal._id": id },
              {
                $set: {
                  "meal.$": {
                    mealTime,
                    mealName,
                    quantity,
                    calories: ~~nutrition[0].calories,
                    protien: ~~nutrition[0].protein_g,
                    carbs: ~~nutrition[0].carbohydrates_total_g,
                    fat: ~~nutrition[0].fat_total_g,
                    time: new Date(),
                  },
                },
              }
            );
            res.status(200).json({message : "meal is Updated successfully"})
          } else {
            res.send({ message: "please type other Meal Name" });
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  login,
  register,
  addMeal,
  totalData,
  deleteMeal,
  updateMeal,
};

const express = require("express");
const router = express.Router();
const {login,register,addMeal,totalData, deleteMeal, updateMeal} = require("../controler/controler")

router.post("/login",login);
router.post("/register",register);
router.post("/addMeal", addMeal) 
router.get("/totalData/:id", totalData)
router.get("/deleteMeal/:mealId", deleteMeal)
router.post("/updateMeal", updateMeal);

module.exports = router;
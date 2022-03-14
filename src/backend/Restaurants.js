const express = require('express');
const router = express.Router();
//Libraraies -------------------
const Joi = require("Joi");
//Import RestaurantsData
const restaurantsData = require('./RestaurantsData.json');


// ---------------------------------- MIDDLEWARES -----------------------------------------





// ----------------------------------------- ROUTES -----------------------------------------
//------------------------------ WE ARE IN : localhost:8000/restaurants/ --------------------

router.get('/', (req,res) => {
    res.status(201).json(restaurantsData);
})





// Exporting the router
module.exports = router;
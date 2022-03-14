const express = require('express');
const router = express.Router();
//Libraraies -------------------
const Joi = require("Joi");
//Import RestaurantsData
const HotelsData = require('./HotelsData.json');



// ---------------------------------- MIDDLEWARES -----------------------------------------





// ----------------------------------------- ROUTES -----------------------------------------
//------------------------------ WE ARE IN : localhost:8000/hotels/ --------------------

router.get('/', (req,res) => {
    res.status(201).json(HotelsData);
})


// Exporting the router
module.exports = router;
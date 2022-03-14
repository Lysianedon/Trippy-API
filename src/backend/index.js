const express = require('express');
const app = express();
const router = express.Router();
const port = 8000;
//Libraraies -------------------
const Joi = require("Joi");
//------- Routes imports -------
const hotels = require('./Hotels');
const restaurants = require('./Restaurants');


// ---------------------------------- MIDDLEWARES -----------------------------------------
app.use(express.json());

const debug = app.use((req,res,next) => {

    console.log("request received.");
    next();
})













app.listen(port, () => {

    console.log(`Local host launched at port ${port}`);
})
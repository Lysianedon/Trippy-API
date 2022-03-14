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


app.get('/', (req,res)=> {

    res.status(201).json(
    {
        title : "OVERVIEW : HOW TO CALL THE API :",

        root : "'/' : you are here",

        all : "localhost:8000/all - Get the list of all restaurants and hotels",

        restaurants : {
            all : "localhost:8000/restaurants - Get the list of all restaurants",
            id : "localhost:8000/restaurants/id/:id - Search a specific restaurant by its ID",
            name :  "localhost:8000/restaurants/name/:name - Search a specific restaurant by its name",
            country : "localhost:8000/restaurants/country/:country - Search restaurants by country",
            city : "localhost:8000/restaurants/city/:city - Search restaurants by city",
            cuisine : "localhost:8000/restaurants/cuisine/:cuisine - Search restaurants by their type of cuisine ",
            pricecategory : "localhost:8000/restaurants/pricecategory/:pricecategory - Search restaurants by price category",
         },

        hotels :{
            all : "localhost:8000/hotels - Get the list of all hotels",
            name : "localhost:8000/hotels/id/:id - Search a specific hotel by its name",
            country : "localhost:8000/hotels/country/:country - Search hotels by country",
            city : "localhost:8000/hotels/city/:city - Search hotels by city",
            stars : "localhost:8000/hotels/cuisine/:stars - Search hotels by their type of cuisine ",
            pool : "localhost:8000/hotels/cuisine/:pool - Search hotels by their type of cuisine ",
            pricecategory : "localhost:8000/hotels/pricecategory/:pricecategory - Search hotels by price category",
         },
                        
    });
})












app.listen(port, () => {

    console.log(`Local host launched at port ${port}`);
})
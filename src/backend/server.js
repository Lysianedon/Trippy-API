const express = require('express');
const app = express();
const router = express.Router();
const port = 8000;
//Libraraies -------------------
const Joi = require("Joi");
const rateLimit = require('express-rate-limit') //rate-limiting middleware for API calls
//------- Routes imports -------
const Hotels = require('./Hotels');
const Restaurants = require('./Restaurants');


// ---------------------------------- MIDDLEWARES -----------------------------------------
app.use(express.json());

const debug = app.use((req,res,next) => {
    console.log("request received.");
    next();
})

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

//RESTAURANTS ROUTES ---------------
app.use('/restaurants', Restaurants);

//HOTELS ROUTES --------------------
app.use('/hotels', Hotels);

// -------------------------------------- ROUTES ------------------------------------------
app.get('/', (req,res)=> {

    res.status(201).json(
    {
        title : "OVERVIEW : HOW TO CALL THE API :",

        root : "'/' : you are here",

        all : "localhost:8000/all - Get the list of all restaurants and hotels",

        restaurants : {
            GET : {

                all : "localhost:8000/restaurants - Get the list of all restaurants",
                id : "localhost:8000/restaurants/id/:id - Search a specific restaurant by its ID",
                name :  "localhost:8000/restaurants/name/:name - Search a specific restaurant by its name",
                country : "localhost:8000/restaurants/country/:country - Search restaurants by country",
                city : "localhost:8000/restaurants/city/:city - Search restaurants by city",
                cuisine : "localhost:8000/restaurants/cuisine/:cuisine - Search restaurants by their type of cuisine ",
                stars : "localhost:8000/restaurants/stars/:stars - Get restaurants by their number of stars",
                pricecategory : "localhost:8000/restaurants/pricecategory/:pricecategory - Search restaurants by price category",
            },

            POST : "localhost:8000/restaurants - Add a new restaurant in the list of hotels",

            PATCH :  "localhost:8000/restaurants/:id - Update a restaurant with its ID",

            DELETE : "localhost:8000/restaurants/:id - Delete a restaurant with its ID",
         },

        hotels : {
            GET : {

                all : "localhost:8000/hotels - Get the list of all hotels",
                id : "localhost:8000/hotels/id/:id - Get an hotel by its ID",
                name : "localhost:8000/hotels/name/:name - Get a specific hotel by its name",
                country : "localhost:8000/hotels/country/:country - Get hotels by country",
                city : "localhost:8000/hotels/city/:city - Get hotels by city",
                stars : "localhost:8000/hotels/stars/:stars - Get hotels by their number of stars",
                spa : "localhost:8000/hotels/spa/ - Get hotels with a spa ",
                pool : "localhost:8000/hotels/pool - Get hotels with a pool ",
                pricecategory : "localhost:8000/hotels/pricecategory/:pricecategory - Get hotels by price category",
            },

            POST : "localhost:8000/hotels - Add a new hotel in the list of hotels",

            PATCH :  "localhost:8000/hotels/:id - Update an hotel with its ID",

            DELETE : "localhost:8000/hotels/:id - Delete an hotel with its ID",
            
         },
                        
    });
})


app.get('*', (req,res)=> {
    res.status(404).json({message : "404 NOT FOUND."});
})






app.listen(port, () => {

    console.log(`Local host launched at port ${port}`);
})
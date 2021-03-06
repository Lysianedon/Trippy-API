const express = require('express');
const router = express.Router();
const mongoose = require("mongoose"); //MongoDB
const Restaurant = require("./models/restaurantModel"); //MangoDB models

//Libraraies -------------------
const Joi = require("Joi");
const uniqid = require("uniqid");
//Import RestaurantsData
let restaurantsData = require('./RestaurantsData.json');
//Import PremiumUsers List : 
const premiumUsers = require('./PremiumUsers');

const dotenv = require("dotenv");
dotenv.config({
	path: "./config.env",
});
const { Pool } = require("pg");
const { findOne } = require('./models/restaurantModel');
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

// CONNECTING TO MONGODB 
mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5sekn.mongodb.net/konexio?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
		}
	)
	.then(() => console.log("Connected to MongoDB"));

// ---------------------------------- MIDDLEWARES -----------------------------------------

// >-------FIND RESTAURANT BY ID ----------->
function findRestaurantByID(req,res,next) {
    const id = req.params.id;
    
    const restaurant = restaurantsData.find(restaurant => {
        return restaurant.id.toString() === id;
    })

    if (restaurant === undefined) {
        return res.status(404).json({message : "This restaurant doesn't exist. "})
    }

    req.restaurant = restaurant;

    next();
}

//>------- CHECK IF RESTAURANT NAME ALREADY EXISTS ----------->
async function checkIfRestaurantNameAlreadyExists(req,res,next) {
    if (req.params.name) {
        let restaurant = req.params.name.replaceAll('-', ' ').toLowerCase();
        try {
            restaurant = await Restaurant.findOne({name : restaurant});
            console.log("restau: ", restaurant);
            
        } catch (error) {
            console.log(error);
            return res.status(401).json({message : "A problem happened."})
        }

        if (restaurant === null || restaurant === undefined) {
            req.paramNameRestaurantExists = false;
        } else {
            req.paramNameRestaurantExists = true;
            req.restaurant = restaurant;
        }
    }

    if (req.body.name) {
        
        let restaurant = req.body.name.replaceAll('-', ' ').toLowerCase();
        try {
            restaurant = await Restaurant.findOne({name : restaurant});
            
        } catch(err) {
            console.log(err);
            res.status(201).json({message : "An error occured."})
        }

        if (restaurant === null || restaurant === undefined) {
            req.bodyNameRestaurantExists = false;
        } else {
            req.bodyNameRestaurantExists = true;
        }
    }

    next();
}

//>------- VALIDATE RESTAURANT'S DATA ----------->
function validateRestaurant(req,res,next){
    
    const restaurant = req.body;
    //CHECKING EVERY VALUE TO SEE IF THEIR FORMAT IS CORRECT :
    //Creating the scheme validation :
    const schema = Joi.object({
        name : Joi.string().min(1).max(30).required(),
        address : Joi.string().min(5).max(90).required(),
        city : Joi.string().min(1).max(30).required(),
        country : Joi.string().min(1).max(30).required(),
        stars :  Joi.number().integer().min(1).max(5).strict().required(),
        cuisine :  Joi.string().min(1).max(30).required(),
        priceCategory :  Joi.number().integer().min(1).max(3).strict().required(),
    })

    const validateRestaurantInfos = schema.validate(restaurant);
    //Guard : 
    if (validateRestaurantInfos.error) {
        return res.status(400).json({
            message : validateRestaurantInfos.error.details[0].message,
        })
    }

    next();
}

// >-------FIND RESTAURANT BY ID ----------->
async function findRestaurantByID(req,res,next) {

    const id = req.params.id;
    let restaurant;
    //Making sure the ID param is valid : 
    const schema = Joi.string().min(1).max(50).required();
    const validateRestaurantInfos = schema.validate(id);
    
    //Guard : if the ID is not valid, an error message is returned : 
    if (validateRestaurantInfos.error) {
        return res.status(400).json({
            message : validateRestaurantInfos.error.details[0].message,
        })
    }
    
    try {
        restaurant = await Restaurant.findById(id);
        req.restaurant = restaurant;
        
    } catch (error) {
        req.paramIDExists = false;
    }

    next();
}

// >------- ADD RANDOM ID ----------->
function addRandomID(req,res,next) {
    req.randomID = uniqid();
    req.body.id = req.randomID;
    next();
   };

// >------- SEARCH RESTAURANTS BY CRITERIA -----------> 
function searchRestaurantsByCriteria (req,res,next) {

    let selectedRestaurants = restaurantsData;

    //Guard : Checking if the query params exist :
    if (req.query) {
        
        //Adding all of my object keys into an array:
        const keys = Object.keys(req.query);
        
        for (let i = 0; i < keys.length; i++) {
            
            //The key we are looping over : 
            let key = keys[i];
            console.log(key);
           // if query params doesn't exist, a 404 message is returned : 
            if (!selectedRestaurants[0].hasOwnProperty(key)) {
                return res.status(404).json({error : `The filter "${keys[i]}" doesn't exist.`})
            }
            //Adding the value to req : 
            req.key = req.query[key];

            selectedRestaurants = selectedRestaurants.filter(restaurant => restaurant[key].toString().toLowerCase() === req.query[key].toLowerCase());
            //If no restaurants was found : the function returns a 404 message : 
            if (selectedRestaurants.length === 0) {
                return res.status(404).json(`There is no restaurants matching your criteria.`);
            }
            req.selectedRestaurants = selectedRestaurants;
        }
    }
    req.selectedRestaurants = selectedRestaurants;

    next();
}

// ----------------------------------------- ROUTES -----------------------------------------
//------------------------------ WE ARE IN : localhost:8000/restaurants/ --------------------

//GET all restaurants with or without queries : 
router.get('/',searchRestaurantsByCriteria, async (req,res) => {

    //--------------------------- MONGODB --------------------------------------
    let restaurants;

    try {
        restaurants = await Restaurant.find();

        //If there is no restaurant yet : 
        if (restaurants.length === 0) {
            return res.send("No restaurants added yet.")
        }

    }catch(err) {
        console.log(err);
        res.status(401).json({message : "A problem happened."})
    }
 
    return res.status(201).json({restaurants});

})

//GET A RESTAURANT BY ITS ID: 
router.get('/:id', findRestaurantByID, async (req,res) => {

    //--------------------------- MONGODB --------------------------------------

    //Guard : 
    if (req.paramIDExists === false) {
        return res.status(404).json({message : "This ID doesn't exist."})
    }
    return res.json(req.restaurant);
})

//ADD A NEW RESTAURANT : 
router.post('/',checkIfRestaurantNameAlreadyExists, validateRestaurant, async (req,res)=> {

    let restaurant = req.body, newRestaurant, restaurants;
    //Guard :
    if (req.bodyNameRestaurantExists === true) {
        return res.status(401).json({message : "This restaurant already exists. Please choose another name."})
    }

    try {
        newRestaurant = await Restaurant.create(restaurant);
        restaurants = await Restaurant.find();
    } catch(err) {
        console.log(err);
        return res.status(401).json({message : "An error happened."})
    }

    return res.status(201).json({message : "Restaurant added !", restaurants });

})

//UPDATE A RESTAURANT'S NAME : 
router.patch('/:name', checkIfRestaurantNameAlreadyExists, async (req,res) => {

    let updatedRestaurant, newName = req.body, restaurant;
    req.body.name = req.body.name.toLowerCase().replaceAll('-', ' ');

    //Guard :
    if (req.paramNameRestaurantExists === false) {
        return res.status(404).json({message : "This restaurant doesn't exist."})
    }

    if (req.bodyNameRestaurantExists === true && req.body.name.toLowerCase().replaceAll('-', ' ') !== req.params.name.toLowerCase().replaceAll('-', ' ')) {
        return res.status(401).json({message : "This restaurant already exists. Please choose another name."})
    }

    //Checking if the name is a string :
    const scheme = Joi.object({
        name : Joi.string().min(1).max(30).required(),
    })

    const validateName = scheme.validate(req.body);

    //Guard : 
    if (validateName.error) {
        return res.status(400).json({
            message : validateName.error.details[0].message,
        })
    }
    
    //Find restaurant : 
    try {
        updatedRestaurant = await Restaurant.findOneAndUpdate({name : req.params.name}, newName);
        restaurant = await Restaurant.findOne({name : req.body.name});
    } catch (error) {
        console.log(error);
        return res.status(401).json({message : "A problem happened"}); 
    }

    return res.status(201).json({message : " restaurant's name updated !", restaurant}); 
})

router.delete('/:id', findRestaurantByID, async (req,res) => {
    let deletedRestaurant, restaurants;
    //Guard : 
    if (req.paramIDExists === false) {
        return res.status(404).json({message : "This ID doesn't exist."})
    }

    try {
        deletedRestaurant = await Restaurant.findByIdAndDelete(req.restaurant.id);
        restaurants = await Restaurant.find();

    } catch (error) {
        console.log(error);
        return res.status(401).json({message : "A problem occured."})
        
    }

    return res.status(201).json({message : ` ${deletedRestaurant.name} restaurant successfully deleted !`, restaurants });
})


// Exporting the router
module.exports = router;
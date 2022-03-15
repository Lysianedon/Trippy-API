const express = require('express');
const router = express.Router();
//Libraraies -------------------
const Joi = require("Joi");
const uniqid = require("uniqid");
//Import RestaurantsData
let restaurantsData = require('./RestaurantsData.json');


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
function checkIfRestaurantNameAlreadyExists(req,res,next) {

    if (req.params.name) {
        
        //If the param name is found in the restaurant database, then an error message is displayed : 
        if (restaurantsData.filter(restaurant => restaurant.name.toLowerCase().replace(' ', '-') === req.params.name.toLowerCase().replace(' ', '-')).length <= 0) {
            req.paramsNameExists = false;
            return res.status(404).json({message : "This restaurant doesn't exist in our database. "})
            
        } else {
            req.paramsNameExists = true;
        }   console.log("true : ",req.paramsNameExists);
    }

    if (req.body.name) {
        
        if (restaurantsData.filter(restaurant => restaurant.name.toLowerCase().replace(' ', '-') === req.body.name.toLowerCase().replace(' ', '-')).length <= 0) {
            req.bodyNameExists = false;
            //If the body name is found in the restaurant database, then an error message is displayed : 
        } else {
            req.bodyNameExists = true;
            return res.status(404).json({message : "This restaurant already exists. Please choose another name."})
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

        // id : Joi.number().integer().min(3).strict().required(),
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

// >------- ADD RANDOM ID ----------->
function addRandomID(req,res,next) {
    req.randomID = uniqid();
    req.body.id = req.randomID;
    next();
   };

function searchRestaurantsByCriteria (req,res,next) {

    let selectedRestaurants = restaurantsData;
    if (req.query.country) {
        req.country = req.query.country;
        selectedRestaurants = selectedRestaurants.filter(restaurant => restaurant.country.toLowerCase() === req.country.toLowerCase());

        if (selectedRestaurants.length === 0) {
            return res.status(404).json(`There is no restaurants in ${req.country}. Please search in another location.`);
        }

        req.selectedRestaurants = selectedRestaurants;

    }

    if (req.query.pricecategory) {
        req.pricecategory = req.query.pricecategory;
        selectedRestaurants = selectedRestaurants.filter(restaurant => restaurant.priceCategory.toString() === req.pricecategory);

        if (selectedRestaurants.length === 0) {
            return res.status(404).json(`There is no restaurants in price category ${req.pricecategory} in ${req.country} .`);
        }

    }
    req.selectedRestaurants = selectedRestaurants;

    next();
}

// ----------------------------------------- ROUTES -----------------------------------------
//------------------------------ WE ARE IN : localhost:8000/restaurants/ --------------------

router.get('/',searchRestaurantsByCriteria, (req,res) => {
    
    return res.status(201).json(req.selectedRestaurants);

})

//GET A RESTAURANT BY ITS ID: 
router.get('/:id', findRestaurantByID, (req,res) => {

    let id = req.params.id;
    const restaurant = restaurantsData.find(restaurant => {
        return restaurant.id.toString() === id;  
    })
    
    return res.status(201).json(restaurant);
})

//ADD A NEW RESTAURANT : 
router.post('/',checkIfRestaurantNameAlreadyExists, validateRestaurant,addRandomID, (req,res)=> {
    const restaurant = req.body;
    restaurantsData.push(restaurant);
    res.status(201).json({message : "Restaurant added !", restaurant : restaurantsData});

})

//UPDATE A RESTAURANT'S NAME : 
router.patch('/:name', checkIfRestaurantNameAlreadyExists, (req,res) => {
    const currentName = req.params.name;
    const newName = req.body.name;
    const restaurantExists = req.paramsNameExists ;
    const nameAlreadyExists = req.bodyNameExists ;
   
    //Find restaurant : 
    let restaurant = restaurantsData.find(restaurant => {
        return restaurant.name.toLowerCase().replace(' ', '-') === currentName.toLowerCase().replace(' ', '-');  
    })

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

    //Updating the restaurant's name in the database:
    restaurant.name = newName;
    return res.status(201).json({message : "restaurant's name updated !", restaurant}); 
})

router.delete('/:id', findRestaurantByID, (req,res) => {
    //Getting the restaurant from the req params, generated by the findRestaurantByID middleware :
    const deletedRestaurant = req.restaurant;

    //Delete function :
    restaurantsData = restaurantsData.filter(restaurant => {
        return restaurant !== deletedRestaurant;
    })

    return res.status(201).json({message : ` ${deletedRestaurant.name} restaurant successfully deleted !`, restaurants : restaurantsData});
})


// Exporting the router
module.exports = router;
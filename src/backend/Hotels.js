const express = require('express');
const router = express.Router();
//Libraraies -------------------
const Joi = require("Joi");
const uniqid = require("uniqid");
//Import HotelsData
let HotelsData = require('./HotelsData.json');

// ---------------------------------- MIDDLEWARES -----------------------------------------

//>------- VALIDATE HOTEL'S DATA ----------->
function validateHotel(req,res,next){
    
    const hotel = req.body;
    //CHECKING EVERY VALUE TO SEE IF THEIR FORMAT IS CORRECT :
    //Creating the scheme validation :
    const schema = Joi.object({

        // id : Joi.number().integer().min(3).strict().required(),
        name : Joi.string().min(1).max(30).required(),
        address : Joi.string().min(5).max(90).required(),
        city : Joi.string().min(1).max(30).required(),
        country : Joi.string().min(1).max(30).required(),
        stars :  Joi.number().integer().min(1).max(5).strict().required(),
        hasSpa : Joi.boolean().strict().required(),
        hasPool : Joi.boolean().strict().required(),
        priceCategory :  Joi.number().integer().min(1).max(3).strict().required(),
    })

    const validateHotelInfos = schema.validate(hotel);
    //Guard : 
    if (validateHotelInfos.error) {
        return res.status(400).json({
            message : validateHotelInfos.error.details[0].message,
        })
    }

    next();
}

//>------- CHECK IF HOTEL NAME ALREADY EXISTS ----------->
function checkIfHotelNameAlreadyExists(req,res,next) {

    if (req.params.name) {
        
        //If the param name is found in the hotel database, then an error message is displayed : 
        if (HotelsData.filter(hotel => hotel.name.toLowerCase().replace(' ', '-') === req.params.name.toLowerCase().replace(' ', '-')).length <= 0) {
            req.paramsNameExists = false;
            return res.status(404).json({message : "This hotel doesn't exist in our database. "})
            
        } else {
            req.paramsNameExists = true;
        }   console.log("true : ",req.paramsNameExists);
    }

    if (req.body.name) {
        
        if (HotelsData.filter(hotel => hotel.name.toLowerCase().replace(' ', '-') === req.body.name.toLowerCase().replace(' ', '-')).length <= 0) {
            req.bodyNameExists = false;
            //If the body name is found in the hotel database, then an error message is displayed : 
        } else {
            req.bodyNameExists = true;
            return res.status(404).json({message : "This hotel already exists. Please choose another name."})
        }
    }

    next();
}

// >-------FIND HOTEL BY ID ----------->
function findHotelByID(req,res,next) {

    const id = req.params.id;
    
    const hotel = HotelsData.find(hotel => {
        return hotel.id.toString() === id;
    })

    if (hotel === undefined) {
        return res.status(404).json({message : "This hotel doesn't exist. "})
    }

    req.hotel = hotel;

    next();
}

// >------- ADD RANDOM ID ----------->
function addRandomID(req,res,next) {
    req.randomID = uniqid();
    req.body.id = req.randomID;
    next();
   };

// >------- SEARCH HOTELS BY CRITERIA -----------> 
function searchHotelsByCriteria (req,res,next) {

    let selectedHotels = HotelsData;
    //If the query params 'country' exists in the URL, then the function will return the list of hotels in the given country : 
    if (req.query.country) {
        req.country = req.query.country;
        selectedHotels = selectedHotels.filter(hotel => hotel.country.toLowerCase() === req.country.toLowerCase());
        //If no hotel was found : the function returns a 404 message : 
        if (selectedHotels.length === 0) {
            return res.status(404).json(`There is no hotel in ${req.country}. Please search in another location.`);
        }

        req.selectedHotels = selectedHotels;
    }
    //If the query params 'pricecatagory' exists in the URL, then the function will return the list of hotels in the given price catagory : 
    if (req.query.pricecategory) {
        req.pricecategory = req.query.pricecategory;
        selectedHotels = selectedHotels.filter(hotel => hotel.priceCategory.toString() === req.pricecategory);
        
         //If no hotel was found : the function returns a 404 message : 
        if (selectedHotels.length === 0) {
            return res.status(404).json(`There is no hotel in price category ${req.pricecategory} in ${req.country} .`);
        }
    }
    //If the query params 'spa' exists in the URL, then the function will return the list of hotels with or without a spa : 
    if (req.query.spa) {
        req.spa = req.query.spa;
        selectedHotels = selectedHotels.filter(hotel => hotel.hasSpa.toString() === req.spa);

         //If no hotel was found : the function returns a 404 message : 
        if (selectedHotels.length === 0) {
            return res.status(404).json(`No hotel was found within these criteria.`);
        }
    }

    //If the query params 'pool' exists in the URL, then the function will return the list of hotels with or without a pool : 
    if (req.query.pool) {
        req.pool = req.query.pool;
        selectedHotels = selectedHotels.filter(hotel => hotel.hasPool.toString() === req.pool);

            //If no hotel was found : the function returns a 404 message : 
        if (selectedHotels.length === 0) {
            return res.status(404).json(`No hotel was found within these criteria.`);
        }
    }

    req.selectedHotels = selectedHotels;

    next();
}

// ----------------------------------------- ROUTES -----------------------------------------
//------------------------------ WE ARE IN : localhost:8000/hotels/ -------------------------

//GET THE LIST OF ALL HOTELS  : 
router.get('/',searchHotelsByCriteria, (req,res) => {
    return res.status(201).json({results : req.selectedHotels});

})

//GET A HOTEL BY ITS ID: 
router.get('/:id', findHotelByID, (req,res) => {

    let id = req.params.id;
    const hotel = HotelsData.find(hotel => {
        return hotel.id.toString() === id;  
    })
    
    return res.status(201).json(hotel);
})

//ADD A NEW HOTEL : 
router.post('/',checkIfHotelNameAlreadyExists, validateHotel,addRandomID, (req,res)=> {
    const hotel = req.body;
    HotelsData.push(hotel);
    res.status(201).json({message : "Hotel added !", hotels : HotelsData});

})

//UPDATE A HOTEL'S NAME : 
router.patch('/:name', checkIfHotelNameAlreadyExists, (req,res) => {
    const currentName = req.params.name;
    const newName = req.body.name;
    const hotelExists = req.paramsNameExists ;
    const nameAlreadyExists = req.bodyNameExists ;
   
    //Find hotel : 
    let hotel = HotelsData.find(hotel => {
        return hotel.name.toLowerCase().replace(' ', '-') === currentName.toLowerCase().replace(' ', '-');  
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

    //Updating the hotel's name in the database:
    hotel.name = newName;
    return res.status(201).json({message : "Hotel's name updated !", hotel}); 
})

router.delete('/:id', findHotelByID, (req,res) => {
    //Getting the hotel from the req params, generated by the findHotelByID middleware :
    const deletedHotel = req.hotel;

    //Delete function :
    HotelsData = HotelsData.filter(hotel => {
        return hotel !== deletedHotel;
    })

    return res.status(201).json({message : ` ${deletedHotel.name} Hotel successfully deleted !`, hotels : HotelsData});
})


// Exporting the router
module.exports = router;
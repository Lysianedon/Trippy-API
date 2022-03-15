const express = require('express');
const router = express.Router();
//Libraraies -------------------
const Joi = require("Joi");
//Import RestaurantsData
let HotelsData = require('./HotelsData.json');



// ---------------------------------- MIDDLEWARES -----------------------------------------

function validateHotel(req,res,next){
    
    const hotel = req.body;
    //CHECKING EVERY VALUE TO SEE IF THEIR FORMAT IS CORRECT :
    //Creating the scheme validation :
    const schema = Joi.object({

        id : Joi.number().integer().min(3).strict().required(),
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

function checkIfHotelAlreadyExists(req,res,next) {

    if (req.body.name) {
        
        if (HotelsData.filter(hotel => hotel.name.toLowerCase().replace(' ', '-') === req.body.name.toLowerCase().replace(' ', '-')).length <= 0) {
            req.bodyNameExists = false;

        } else {
            req.bodyNameExists = true;
            return res.status(404).json({message : "This hotel already exist. Please choose another name."})
        }
    }

    if (req.params.name) {
        
        if (HotelsData.filter(hotel => hotel.name.toLowerCase().replace(' ', '-') === req.params.name.toLowerCase().replace(' ', '-')).length <= 0) {
            req.paramsNameExists = false;
            return res.status(404).json({message : "This hotel doesn't exist in our database. "})
            
        } else {
            req.paramsNameExists = true;
        }   console.log("true : ",req.paramsNameExists);
    }

    // if (req.params.id) {
    //     if (HotelsData.filter(hotel => hotel.id.toString() === req.params.id).length <= 0) {
    //         req.paramsIdExists = false;
    //     } else {
    //         req.paramsIdExists = true;
    //     }

    // }

    // if (req.body.id) {
    //     if (HotelsData.filter(hotel => hotel.id === req.body.id).length <= 0) {
    //         req.bodyIdExists = false;
    //     } else {
    //         req.bodyIdExists = true;
    //     }

    // }

    next();
}


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


// ----------------------------------------- ROUTES -----------------------------------------
//------------------------------ WE ARE IN : localhost:8000/hotels/ -------------------------

//GET THE LIST OF ALL HOTELS : 
router.get('/', (req,res) => {
    res.status(201).json(HotelsData);
})

//GET A HOTEL BY ITS ID: 
router.get('/:id', (req,res) => {

    let id = req.params.id;
    const hotel = HotelsData.find(hotel => {
        return hotel.id.toString() === id;  
    })
    
    return res.status(201).json(hotel);
})

//ADD A NEW HOTEL : 
router.post('/',validateHotel, (req,res)=> {
    const hotel = req.body;
    HotelsData.push(hotel);
    res.status(201).json({message : "Hotel added !"});

})

//UPDATE A HOTEL'S NAME : 
router.patch('/:name', checkIfHotelAlreadyExists, (req,res) => {
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

            const validateName = scheme.validate(newName);

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
    const deletedHotel = req.hotel;

    //Delete function :
    HotelsData = HotelsData.filter(hotel => {
        return hotel !== deletedHotel;
    })

    return res.status(201).json({message : ` ${deletedHotel.name} Hotel successfully deleted !`, hotels : HotelsData});
})



// Exporting the router
module.exports = router;
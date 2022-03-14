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

function checkIfHotelExists(req,res,next) {



    next();
}



function findHotelByID(req,res,next) {

    const id = req.params.id;
    
    const hotel = HotelsData.find(hotel => {
        return hotel.id.toString() === id;
    })

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
router.patch('/:name', (req,res) => {
    const currentName = req.params.name;
    const newName = req.body.name;

    //Find hotel :
    let hotel = HotelsData.find(hotel => {
        return hotel.name.toLowerCase().replace(' ', '-') === currentName.toLowerCase().replace(' ', '-');  
    })

    //Updating the hotel's name in the database:
    hotel.name = newName;
    res.status(201).json({message : "Hotel's name updated !", hotel});
})

router.delete('/:id',findHotelByID, (req,res) => {
    const deletedHotel = req.hotel;

    //Delete function :
    HotelsData = HotelsData.filter(hotel => {
        return hotel !== deletedHotel;
    })

    return res.status(201).json({message : ` ${deletedHotel.name} Hotel successfully deleted !`, hotels : HotelsData});
})



// Exporting the router
module.exports = router;
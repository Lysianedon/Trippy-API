const mongoose = require("mongoose");

// créer un schéma
const restaurantScheme = new mongoose.Schema({

	name : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 30,
		lowercase : true,
		unique: true,
	},
	address : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 100,
        lowercase : true,
	},

	city : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 100,
        lowercase : true,
	},

	country : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 100,
        lowercase : true,
	},

	stars : {
		type: Number,
		required : true,
		min : 1,
		max : 5,
	}, 

	cuisine : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 20,
		lowercase : true,
	},
    priceCategory : {
        type: Number,
		required : true,
		min : 1,
		max : 3,
    }	
});

// Create a model : 
const Restaurant = mongoose.model("Restaurant", restaurantScheme);

// exporter le modèle
module.exports = Restaurant;
const mongoose = require('mongoose');

const cart = new mongoose.Schema({
    user:{
        type: mongoose.Schema.objectId,
        ref: 'User',
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    },
    carrito: {
        type: Object,
    }
})
const mongoose = require('mongoose');
const User = require('./user');

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

const Cart = mongoose.model('Cart', cart);

module.exports = Cart
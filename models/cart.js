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
    carrito: [{
        articulo: {
            type: String,
            ref: 'Product',
        },
        cantidad: {
            type: Number,
            required: [true, 'La cantidad mínima debe ser 1(un) producto.'],
        },
        precio: Number,
        total: Number,
    }],
    precioTotal: {
        type: Number,
        required: true,
    }
})

cart.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'user',
        select: 'nombre',
    });
    next();
});

const Cart = mongoose.model('Cart', cart);

module.exports = Cart
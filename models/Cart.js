const mongoose = require('mongoose');

const cartProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1'],
        default: 1
    }
}, {
    _id: false
});

const cartSchema = new mongoose.Schema({
    products: {
        type: [cartProductSchema],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false
});

cartSchema.methods.toJSON = function() {
    const cart = this.toObject();
    cart.id = cart._id;
    delete cart._id;
    return cart;
};

cartSchema.methods.addProduct = function(productId, quantity = 1) {
    const existingProduct = this.products.find(p => p.product.toString() === productId.toString());
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        this.products.push({ product: productId, quantity });
    }
    
    return this.save();
};

cartSchema.methods.updateProductQuantity = function(productId, quantity) {
    const productIndex = this.products.findIndex(p => p.product.toString() === productId.toString());
    
    if (productIndex === -1) {
        throw new Error('Producto no encontrado en el carrito');
    }
    
    if (quantity <= 0) {
        this.products.splice(productIndex, 1);
    } else {
        this.products[productIndex].quantity = quantity;
    }
    
    return this.save();
};

cartSchema.methods.removeProduct = function(productId) {
    this.products = this.products.filter(p => p.product.toString() !== productId.toString());
    return this.save();
};

cartSchema.methods.clearCart = function() {
    this.products = [];
    return this.save();
};

cartSchema.methods.updateProducts = function(products) {
    const validProducts = products.map(item => {
        if (!item.product || !item.quantity) {
            throw new Error('Cada producto debe tener product y quantity');
        }
        return {
            product: item.product,
            quantity: parseInt(item.quantity)
        };
    });
    
    this.products = validProducts;
    return this.save();
};

cartSchema.statics.findByIdWithProducts = function(cartId) {
    return this.findById(cartId).populate({
        path: 'products.product',
        model: 'Product'
    });
};

module.exports = mongoose.model('Cart', cartSchema);
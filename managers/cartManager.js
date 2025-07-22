const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartManager {
    constructor() {
        console.log('🛒 CartManager inicializado con MongoDB');
    }

    async createCart() {
        try {
            const newCart = new Cart();
            const savedCart = await newCart.save();
            return savedCart.toJSON();
        } catch (error) {
            throw new Error('Error al crear el carrito: ' + error.message);
        }
    }

    async getCartById(id) {
        try {
            const cart = await Cart.findByIdWithProducts(id);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart.toJSON();
        } catch (error) {
            if (error.message === 'Carrito no encontrado') {
                throw error;
            }
            throw new Error('Error al obtener el carrito: ' + error.message);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('El producto no existe');
            }

            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            await cart.addProduct(productId, quantity);
            
            const updatedCart = await Cart.findByIdWithProducts(cartId);
            return updatedCart.toJSON();
        } catch (error) {
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            await cart.removeProduct(productId);
            
            const updatedCart = await Cart.findByIdWithProducts(cartId);
            return updatedCart.toJSON();
        } catch (error) {
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('El producto no existe');
            }

            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            await cart.updateProductQuantity(productId, quantity);
            
            const updatedCart = await Cart.findByIdWithProducts(cartId);
            return updatedCart.toJSON();
        } catch (error) {
            throw error;
        }
    }

    async updateCartProducts(cartId, products) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            for (const item of products) {
                const product = await Product.findById(item.product);
                if (!product) {
                    throw new Error(`El producto con ID ${item.product} no existe`);
                }
            }

            await cart.updateProducts(products);
            
            const updatedCart = await Cart.findByIdWithProducts(cartId);
            return updatedCart.toJSON();
        } catch (error) {
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            await cart.clearCart();
            
            const updatedCart = await Cart.findByIdWithProducts(cartId);
            return updatedCart.toJSON();
        } catch (error) {
            throw error;
        }
    }

    async getCarts() {
        try {
            const carts = await Cart.find().lean();
            return carts.map(cart => ({
                id: cart._id,
                ...cart,
                _id: undefined
            }));
        } catch (error) {
            throw new Error('Error al obtener carritos: ' + error.message);
        }
    }

    async getCartProducts(cartId) {
        try {
            const cart = await Cart.findByIdWithProducts(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart.products;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CartManager;
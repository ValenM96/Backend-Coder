const express = require('express');
const CartManager = require('../managers/CartManager');

const router = express.Router();
const cartManager = new CartManager();

// POST / - Crear nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({
            status: 'success',
            payload: newCart
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// GET /:cid - Obtener productos de un carrito con populate
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        res.json({
            status: 'success',
            payload: cart
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado') {
            res.status(404).json({ 
                status: 'error',
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: error.message 
            });
        }
    }
});

// POST /:cid/products/:pid - Agregar producto al carrito (UNIFICADO)
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;
        
        const updatedCart = await cartManager.addProductToCart(cid, pid, parseInt(quantity));
        res.json({
            status: 'success',
            payload: updatedCart
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado' || error.message === 'El producto no existe') {
            res.status(404).json({ 
                status: 'error',
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: error.message 
            });
        }
    }
});

// DELETE /:cid/products/:pid - Eliminar producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.removeProductFromCart(cid, pid);
        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito',
            payload: updatedCart
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado') {
            res.status(404).json({ 
                status: 'error',
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: error.message 
            });
        }
    }
});

// PUT /:cid - Actualizar todos los productos del carrito
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ 
                status: 'error',
                error: 'El campo products debe ser un array' 
            });
        }

        const updatedCart = await cartManager.updateCartProducts(cid, products);
        res.json({
            status: 'success',
            message: 'Carrito actualizado correctamente',
            payload: updatedCart
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado' || error.message.includes('no existe')) {
            res.status(404).json({ 
                status: 'error',
                error: error.message 
            });
        } else if (error.message.includes('product y quantity')) {
            res.status(400).json({ 
                status: 'error',
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: error.message 
            });
        }
    }
});

// PUT /:cid/products/:pid - Actualizar cantidad de un producto específico
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({ 
                status: 'error',
                error: 'El campo quantity es obligatorio' 
            });
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({ 
                status: 'error',
                error: 'La cantidad debe ser un número entero positivo' 
            });
        }

        const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
        res.json({
            status: 'success',
            message: 'Cantidad actualizada correctamente',
            payload: updatedCart
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado' || 
            error.message === 'El producto no existe' ||
            error.message === 'Producto no encontrado en el carrito') {
            res.status(404).json({ 
                status: 'error',
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: error.message 
            });
        }
    }
});

// DELETE /:cid - Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const updatedCart = await cartManager.clearCart(cid);
        res.json({
            status: 'success',
            message: 'Todos los productos fueron eliminados del carrito',
            payload: updatedCart
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado') {
            res.status(404).json({ 
                status: 'error',
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: error.message 
            });
        }
    }
});

module.exports = router;
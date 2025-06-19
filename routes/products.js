const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        res.json(product);
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await productManager.addProduct(productData);
        
        if (req.io) {
            const products = await productManager.getProducts();
            req.io.emit('products-updated', products);
        }
        
        res.status(201).json(newProduct);
    } catch (error) {
        if (error.message.includes('campos obligatorios') || error.message.includes('código del producto ya existe')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updateData = req.body;
        const updatedProduct = await productManager.updateProduct(pid, updateData);
        res.json(updatedProduct);
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            res.status(404).json({ error: error.message });
        } else if (error.message.includes('código del producto ya existe')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await productManager.deleteProduct(pid);
        
        if (req.io) {
            const products = await productManager.getProducts();
            req.io.emit('products-updated', products);
        }
        
        res.json({ message: 'Producto eliminado correctamente', product: deletedProduct });
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;
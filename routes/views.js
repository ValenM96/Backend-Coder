const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { 
            title: 'Lista de Productos',
            products: products,
            hasProducts: products.length > 0
        });
    } catch (error) {
        res.render('home', { 
            title: 'Lista de Productos',
            products: [],
            hasProducts: false,
            error: 'Error al cargar productos'
        });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { 
            title: 'Productos en Tiempo Real',
            products: products,
            hasProducts: products.length > 0
        });
    } catch (error) {
        res.render('realTimeProducts', { 
            title: 'Productos en Tiempo Real',
            products: [],
            hasProducts: false,
            error: 'Error al cargar productos'
        });
    }
});

module.exports = router;
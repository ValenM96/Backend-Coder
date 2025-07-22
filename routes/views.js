const express = require('express');
const ProductManager = require('../managers/productManager');
const CartManager = require('../managers/cartManager');

const router = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
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

router.get('/products', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort,
            query,
            category,
            status
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            query,
            category
        };

        if (status !== undefined) {
            options.status = status === 'true';
        }

        const result = await productManager.getProducts(options);

        const baseUrl = '/products';
        const buildUrl = (pageNum, extraParams = {}) => {
            const params = new URLSearchParams();
            params.set('page', pageNum);
            params.set('limit', limit);
            if (sort) params.set('sort', sort);
            if (query) params.set('query', query);
            if (category) params.set('category', category);
            if (status !== undefined) params.set('status', status);
            
            Object.entries(extraParams).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });
            
            return `${baseUrl}?${params.toString()}`;
        };

        res.render('products', {
            title: 'Catálogo de Productos',
            products: result.payload,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                prevLink: result.hasPrevPage ? buildUrl(result.prevPage) : null,
                nextLink: result.hasNextPage ? buildUrl(result.nextPage) : null
            },
            filters: {
                sort,
                query,
                category,
                status,
                limit
            },
            hasProducts: result.payload.length > 0,
            sortAscUrl: buildUrl(page, { sort: 'asc' }),
            sortDescUrl: buildUrl(page, { sort: 'desc' }),
            availableUrl: buildUrl(page, { status: 'true' }),
            unavailableUrl: buildUrl(page, { status: 'false' }),
            allUrl: buildUrl(page, { status: undefined })
        });
    } catch (error) {
        res.render('products', { 
            title: 'Catálogo de Productos',
            products: [],
            hasProducts: false,
            error: 'Error al cargar productos: ' + error.message
        });
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        
        res.render('productDetail', {
            title: `${product.title} - Detalle`,
            product: product,
            backUrl: req.get('Referrer') || '/products'
        });
    } catch (error) {
        res.render('productDetail', {
            title: 'Producto no encontrado',
            error: error.message,
            backUrl: '/products'
        });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        
        let total = 0;
        if (cart.products && cart.products.length > 0) {
            total = cart.products.reduce((sum, item) => {
                return sum + (item.product.price * item.quantity);
            }, 0);
        }

        res.render('cart', {
            title: `Carrito ${cid}`,
            cart: cart,
            cartId: cid,
            hasProducts: cart.products && cart.products.length > 0,
            total: total.toFixed(2),
            productsCount: cart.products ? cart.products.length : 0
        });
    } catch (error) {
        res.render('cart', {
            title: 'Carrito no encontrado',
            error: error.message,
            cartId: req.params.cid,
            hasProducts: false,
            total: '0.00',
            productsCount: 0
        });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
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
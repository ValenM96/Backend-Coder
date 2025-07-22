const express = require('express');
const ProductManager = require('../managers/productManager');

const router = express.Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const {
            limit = 10,
            page = 1,
            sort,
            query,
            category,
            status
        } = req.query;

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query,
            category
        };

        if (status !== undefined) {
            if (status === 'true') options.status = true;
            else if (status === 'false') options.status = false;
        }

        const result = await productManager.getProducts(options);

        const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const buildLink = (pageNum) => {
            if (!pageNum) return null;
            
            const params = new URLSearchParams();
            params.set('page', pageNum);
            params.set('limit', limit);
            if (sort) params.set('sort', sort);
            if (query) params.set('query', query);
            if (category) params.set('category', category);
            if (status !== undefined) params.set('status', status);
            
            return `${baseUrl}?${params.toString()}`;
        };

        const response = {
            status: 'success',
            payload: result.payload,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: buildLink(result.prevPage),
            nextLink: buildLink(result.nextPage)
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        res.json({
            status: 'success',
            payload: product
        });
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
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

router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await productManager.addProduct(productData);
        
        if (req.io) {
            const products = await productManager.getAllProducts();
            req.io.emit('products-updated', products);
        }
        
        res.status(201).json({
            status: 'success',
            payload: newProduct
        });
    } catch (error) {
        const statusCode = error.message.includes('código del producto ya existe') || 
                        error.message.includes('obligatorio') ? 400 : 500;
        res.status(statusCode).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updateData = req.body;
        const updatedProduct = await productManager.updateProduct(pid, updateData);
        
        if (req.io) {
            const products = await productManager.getAllProducts();
            req.io.emit('products-updated', products);
        }
        
        res.json({
            status: 'success',
            payload: updatedProduct
        });
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            res.status(404).json({ 
                status: 'error',
                error: error.message 
            });
        } else if (error.message.includes('código del producto ya existe')) {
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

router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await productManager.deleteProduct(pid);
        
        if (req.io) {
            const products = await productManager.getAllProducts();
            req.io.emit('products-updated', products);
        }
        
        res.json({ 
            status: 'success',
            message: 'Producto eliminado correctamente', 
            payload: deletedProduct 
        });
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
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
const Product = require('../models/Product');

class ProductManager {
    constructor() {
        console.log('📦 ProductManager inicializado con MongoDB');
    }

    async addProduct(productData) {
        try {
            const { title, description, code, price, status = true, stock, category, thumbnails = [] } = productData;

            const newProduct = new Product({
                title,
                description,
                code,
                price: Number(price),
                status: Boolean(status),
                stock: Number(stock),
                category,
                thumbnails: Array.isArray(thumbnails) ? thumbnails : []
            });

            const savedProduct = await newProduct.save();
            return savedProduct.toJSON();
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('El código del producto ya existe');
            }
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                throw new Error(messages.join(', '));
            }
            throw new Error('Error al crear el producto: ' + error.message);
        }
    }

    async getProducts(options = {}) {
        try {
            const {
                limit = 10,
                page = 1,
                sort = null,
                query = null,
                category = null,
                status = null
            } = options;

            const paginateOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                lean: true,
                customLabels: {
                    docs: 'payload',
                    totalDocs: 'totalDocs',
                    totalPages: 'totalPages',
                    page: 'page',
                    pagingCounter: 'pagingCounter',
                    hasPrevPage: 'hasPrevPage',
                    hasNextPage: 'hasNextPage',
                    prevPage: 'prevPage',
                    nextPage: 'nextPage'
                }
            };

            if (sort) {
                if (sort.toLowerCase() === 'asc') {
                    paginateOptions.sort = { price: 1 };
                } else if (sort.toLowerCase() === 'desc') {
                    paginateOptions.sort = { price: -1 };
                }
            }

            const filters = {};
            if (category) filters.category = category;
            if (status !== null) filters.status = status;
            if (query) filters.query = query;

            const result = await Product.findWithFilters(filters, paginateOptions);
            
            result.payload = result.payload.map(product => ({
                id: product._id,
                ...product,
                _id: undefined
            }));

            return result;
        } catch (error) {
            throw new Error('Error al obtener productos: ' + error.message);
        }
    }

    async getAllProducts() {
        try {
            const products = await Product.find().lean();
            return products.map(product => ({
                id: product._id,
                ...product,
                _id: undefined
            }));
        } catch (error) {
            throw new Error('Error al obtener todos los productos: ' + error.message);
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findById(id).lean();
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            return {
                id: product._id,
                ...product,
                _id: undefined
            };
        } catch (error) {
            if (error.message === 'Producto no encontrado') {
                throw error;
            }
            throw new Error('Error al obtener el producto: ' + error.message);
        }
    }

    async updateProduct(id, updateData) {
        try {
            delete updateData.id;
            delete updateData._id;

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updateData,
                { 
                    new: true,
                    runValidators: true
                }
            ).lean();

            if (!updatedProduct) {
                throw new Error('Producto no encontrado');
            }

            return {
                id: updatedProduct._id,
                ...updatedProduct,
                _id: undefined
            };
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('El código del producto ya existe');
            }
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                throw new Error(messages.join(', '));
            }
            if (error.message === 'Producto no encontrado') {
                throw error;
            }
            throw new Error('Error al actualizar el producto: ' + error.message);
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id).lean();
            if (!deletedProduct) {
                throw new Error('Producto no encontrado');
            }
            return {
                id: deletedProduct._id,
                ...deletedProduct,
                _id: undefined
            };
        } catch (error) {
            if (error.message === 'Producto no encontrado') {
                throw error;
            }
            throw new Error('Error al eliminar el producto: ' + error.message);
        }
    }
}

module.exports = ProductManager;
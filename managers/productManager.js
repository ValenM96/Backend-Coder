const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor() {
        this.path = path.join(__dirname, '../data/products.json');
        this.products = [];
        this.init();
    }

    async init() {
        try {
            await this.createDataDir();
            await this.loadProducts();
        } catch (error) {
            console.error('Error inicializando ProductManager:', error);
        }
    }

    async createDataDir() {
        const dataDir = path.dirname(this.path);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.products = [];
                await this.saveProducts();
            } else {
                throw error;
            }
        }
    }

    async saveProducts() {
        await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
    }

    generateId() {
        if (this.products.length === 0) return 1;
        const maxId = Math.max(...this.products.map(p => parseInt(p.id)));
        return maxId + 1;
    }

    async addProduct(productData) {
        const { title, description, code, price, status = true, stock, category, thumbnails = [] } = productData;

        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            throw new Error('Todos los campos obligatorios deben ser completados');
        }

        const existingProduct = this.products.find(p => p.code === code);
        if (existingProduct) {
            throw new Error('El código del producto ya existe');
        }

        const newProduct = {
            id: this.generateId(),
            title,
            description,
            code,
            price: Number(price),
            status: Boolean(status),
            stock: Number(stock),
            category,
            thumbnails: Array.isArray(thumbnails) ? thumbnails : []
        };

        this.products.push(newProduct);
        await this.saveProducts();
        return newProduct;
    }

    async getProducts() {
        return this.products;
    }

    async getProductById(id) {
        const product = this.products.find(p => p.id == id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }

    async updateProduct(id, updateData) {
        const productIndex = this.products.findIndex(p => p.id == id);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }
        delete updateData.id;

        if (updateData.code) {
            const existingProduct = this.products.find(p => p.code === updateData.code && p.id != id);
            if (existingProduct) {
                throw new Error('El código del producto ya existe');
            }
        }

        this.products[productIndex] = { 
            ...this.products[productIndex], 
            ...updateData 
        };

        await this.saveProducts();
        return this.products[productIndex];
    }

    async deleteProduct(id) {
        const productIndex = this.products.findIndex(p => p.id == id);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }

        const deletedProduct = this.products.splice(productIndex, 1)[0];
        await this.saveProducts();
        return deletedProduct;
    }
}

module.exports = ProductManager;
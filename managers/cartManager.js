const fs = require('fs').promises;
const path = require('path');
const ProductManager = require('./ProductManager');

class CartManager {
    constructor() {
        this.path = path.join(__dirname, '../data/carts.json');
        this.carts = [];
        this.productManager = new ProductManager();
        this.init();
    }

    async init() {
        try {
            await this.createDataDir();
            await this.loadCarts();
        } catch (error) {
            console.error('Error inicializando CartManager:', error);
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

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.carts = [];
                await this.saveCarts();
            } else {
                throw error;
            }
        }
    }

    async saveCarts() {
        await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
    }

    generateId() {
        if (this.carts.length === 0) return 1;
        const maxId = Math.max(...this.carts.map(c => parseInt(c.id)));
        return maxId + 1;
    }

    async createCart() {
        const newCart = {
            id: this.generateId(),
            products: []
        };

        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async getCartById(id) {
        const cart = this.carts.find(c => c.id == id);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart;
    }

    async addProductToCart(cartId, productId) {
        const cartIndex = this.carts.findIndex(c => c.id == cartId);
        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        try {
            await this.productManager.getProductById(productId);
        } catch (error) {
            throw new Error('El producto no existe');
        }

        const cart = this.carts[cartIndex];
        
        const existingProductIndex = cart.products.findIndex(p => p.product == productId);
        
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += 1;
        } else {
            cart.products.push({
                product: productId,
                quantity: 1
            });
        }

        await this.saveCarts();
        return cart;
    }

    async getCarts() {
        return this.carts;
    }
}

module.exports = CartManager;
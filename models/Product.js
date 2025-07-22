const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'El código es obligatorio'],
        unique: true,
        trim: true,
        uppercase: true
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio debe ser positivo']
    },
    status: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo']
    },
    category: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        trim: true
    },
    thumbnails: {
        type: [String],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false
});


productSchema.plugin(mongoosePaginate);

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });

productSchema.methods.toJSON = function() {
    const product = this.toObject();
    product.id = product._id;
    delete product._id;
    return product;
};

productSchema.statics.findWithFilters = function(filters = {}, options = {}) {
    const query = {};
    
    if (filters.category) {
        query.category = new RegExp(filters.category, 'i');
    }
    
    if (filters.status !== undefined) {
        query.status = filters.status;
    }
    
    if (filters.query) {
        query.$or = [
            { title: new RegExp(filters.query, 'i') },
            { description: new RegExp(filters.query, 'i') },
            { category: new RegExp(filters.query, 'i') }
        ];
    }
    
    return this.paginate(query, options);
};

module.exports = mongoose.model('Product', productSchema);
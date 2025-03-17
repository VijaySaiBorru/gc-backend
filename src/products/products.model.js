const { Schema, model, default: mongoose } = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: String,
    rating: { type: Number, default: 0 },
    sellerId: { type: mongoose.Types.ObjectId, ref: "Seller", required: true },
    seller:{type:String,required:true,default:"seller"},
    quantity: { type: Number, default:0}
}, { timestamps: true });

const Products = mongoose.model('Product', productSchema);
module.exports = Products;

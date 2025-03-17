const {Schema,model, default: mongoose} = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    comment:{type:String, require:true},
    rating:{type:Number , default:0},
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    productId:{type:mongoose.Schema.Types.ObjectId, ref:"Product",required:true}, 
},{timestamps:true});

const Reviews = mongoose.model('Review',ReviewSchema);
module.exports=Reviews;
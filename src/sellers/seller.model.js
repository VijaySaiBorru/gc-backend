const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const sellerSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: String,
    bio: { type: String, maxlength: 200 },
    timings:{type:String },
    address:String,
    contact:String,
    role:{type:String,required:true,default:"seller"},
    createdAt: { type: Date, default: Date.now },
});

sellerSchema.pre('save', async function (next) {
    const seller = this;
    if (!seller.isModified('password')) return next();
    const hashedPassword = await bcrypt.hash(seller.password, 10);
    seller.password = hashedPassword;
    next();
});

// Method to compare passwords
sellerSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Seller = model('Seller', sellerSchema);
module.exports = Seller;

const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const Seller = require("../sellers/seller.model");
const JWT_SECRET=process.env.JWT_SECRET_KEY

const generateToken= async(userId)=>{
    try{
        const user=await User.findById(userId);
        if(!user){
            throw new Error("User not found.");
        }
        const token = jwt.sign({userId:user._id},JWT_SECRET,{
            expiresIn:"1h",
        })
        return token;
    }
    catch(error){
        console.error("Error generating token:", error.message);
        throw error;
    }
}
const generatesellerToken= async(userId)=>{
    try{
        const seller=await Seller.findById(userId);
        if(!seller){
            throw new Error("Seller not found.");
        }
        const token = jwt.sign({userId:seller._id},JWT_SECRET,{
            expiresIn:"1h",
        })
        return token;
    }
    catch(error){
        console.error("Error generating token:", error.message);
        throw error;
    }
}

module.exports ={ generateToken,generatesellerToken};
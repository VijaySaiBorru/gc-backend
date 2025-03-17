const express=require('express');
const router=express.Router();
const User = require('../users/user.model');
const generateToken = require('../middleware/generateToken').generateToken;
const verifyToken = require('../middleware/verifyToken');

router.post("/register",async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        const user = new User({email,username,password});
        await user.save();
        res.status(201).send({message:"User registered successfully!"})
    }
    catch(error){
        console.log("Error registering user",error);
        res.status(500).send({message:"Error registering user",})
    }
})

router.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(400).send({message:"User not found"})
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            res.status(400).send({message:"Password not match"})
        }
        const token = await generateToken(user._id);
        res.cookie('token',token,{
            httpOnly:true,
            secure:true,
            sameSite:'None'
        })
        res.status(200).send({message:"Logged in successfully!",token,user:{
            _id:user._id,
            email:user.email,
            username:user.username,
            profileImage:user.profileImage,
            bio:user.bio,
            address:user.address,
            role:user.role
        }})
    }
    catch(error){
        console.log("Error Logging in user",error);
        res.status(500).send({message:"Error in Login user",})
    }
})

router.post("/logout",async(req,res)=>{
    try{
       res.clearCookie('token');
       res.status(200).send({message:"Logged out Successfully",})
    }
    catch(error){
        console.log("Error Logging out user",error);
        res.status(500).send({message:"Error in Logout user",})
    }
})

router.delete("/users/:id",async(req,res)=>{
    try{
       const {id}=req.params;
       const user = await User.findByIdAndDelete(id);
       if(!user){
        return res.status(404).send({message:'User not found'})
       }
       res.status(200).send({message:"User deleted Successfully",})
    }
    catch(error){
        console.log("Error Deleting user",error);
        res.status(500).send({message:"Error Deleting user",})
    }
})

router.get("/users",async(req,res)=>{
    try{
       const users = await User.find({},'id email role').sort({createdAt:-1});
       res.status(200).send(users)
    }
    catch(error){
        console.log("Error fetching users",error);
        res.status(500).send({message:"Error fetching user",})
    }
})

// router.put("/users/:id",async(req,res)=>{
//     try{
//         const {id}=req.params;
//         const {role}=req.body;
//         const user = await User.findByIdAndUpdate(id,{role},{new:true});
//         if(!user){
//          return res.status(404).send({message:'User not found'})
//         }
//         res.status(200).send({message:"User role updated Successfully",user})
//     }
//     catch(error){
//         console.log("Error updating user role",error);
//         res.status(500).send({message:"Error updating user role",})
//     }
// })

router.patch("/edit-profile",async(req,res)=>{
    try{
        const {userId,username,profileImage,bio,address}=req.body;
        if(!userId){
            return res.status(400).send({message:'User ID is required'})
           }
        const user = await User.findById(userId);
        if(!user){
         return res.status(404).send({message:'User not found'})
        }
        if(username !== undefined) user.username=username;
        if(profileImage !== undefined) user.profileImage=profileImage;
        if(bio !== undefined) user.bio=bio;
        if(address !== undefined) user.address=address;
        await user.save();
        res.status(200).send({message:"User Profile updated Successfully",user:{
            _id:user._id,
            email:user.email,
            username:user.username,
            profileImage:user.profileImage,
            bio:user.bio,
            address:user.address,
            role:user.role
        }})
    }
    catch(error){
        console.log("Error updating user details",error);
        res.status(500).send({message:"Error updating user details",})
    }
})


module.exports = router;
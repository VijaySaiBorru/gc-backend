const express=require('express');
const router=express.Router();
const generatesellerToken = require('../middleware/generateToken').generatesellerToken;
const verifyToken = require('../middleware/verifyToken');
const Seller = require('./seller.model');

router.post("/register",async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        const seller = new Seller({email,username,password});
        await seller.save();
        res.status(201).send({message:"Seller registered successfully!"})
    }
    catch(error){
        console.log("Error registering seller",error);
        res.status(500).send({message:"Error registering seller",})
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find seller by email
        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(400).json({ message: "Seller not found" });
        }

        // Check if password matches
        const isMatch = await seller.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Generate token only if seller is found
        const token = await generatesellerToken(seller._id);

        // Set HTTP-only secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        // Send response with seller details
        res.status(200).json({
            message: "Logged in successfully!",
            token:token,
            seller: {
                _id: seller._id,
                email: seller.email,
                username: seller.username,
                profileImage: seller.profileImage,
                bio: seller.bio,
                address: seller.address,
                timings: seller.timings,
                contact: seller.contact,
                role:seller.role
            },
        });
    } catch (error) {
        console.error("Error Logging in seller:", error);
        res.status(500).json({ message: "Error logging in seller" });
    }
});



router.post("/logout",async(req,res)=>{
    try{
       res.clearCookie('token');
       res.status(200).send({message:"Logged out Successfully",})
    }
    catch(error){
        console.log("Error Logging out seller",error);
        res.status(500).send({message:"Error in Logout seller",})
    }
})

router.delete("/sellers/:id",async(req,res)=>{
    try{
       const {id}=req.params;
       const seller = await Seller.findByIdAndDelete(id);
       if(!seller){
        return res.status(404).send({message:'Seller not found'})
       }
       res.status(200).send({message:"Seller deleted Successfully",})
    }
    catch(error){
        console.log("Error Deleting seller",error);
        res.status(500).send({message:"Error Deleting seller",})
    }
})

router.get("/sellers",async(req,res)=>{
    try{
       const sellers = await Seller.find().sort({createdAt:-1});
       res.status(200).send(sellers)
    }
    catch(error){
        console.log("Error fetching sellers",error);
        res.status(500).send({message:"Error fetching sellers",})
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
        const {userId,username,profileImage,bio,address,timings,contact}=req.body;
       // console.log(req.body)
        if(!userId){
            return res.status(400).send({message:'User ID is required'})
           }
        const seller = await Seller.findById(userId);
        if(!seller){
         return res.status(404).send({message:'Seller not found'})
        }
        if(username !== undefined) seller.username=username;
        if(profileImage !== undefined) seller.profileImage=profileImage;
        if(bio !== undefined) seller.bio=bio;
        if(address !== undefined) seller.address=address;
        if(timings !== undefined) seller.timings=timings;
        if(contact !== undefined) seller.contact=contact;
        await seller.save();
        res.status(200).send({message:"Seller Profile updated Successfully",seller:{
            _id:seller._id,
            email:seller.email,
            username:seller.username,
            profileImage:seller.profileImage,
            bio:seller.bio,
            address:seller.address,
            timings:seller.timings,
            contact:seller.contact,
            role:seller.role
        }})
    }
    catch(error){
        console.log("Error updating seller details",error);
        res.status(500).send({message:"Error updating seller details",})
    }
})


module.exports = router;
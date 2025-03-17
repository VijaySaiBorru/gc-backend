const express=require('express');
const router=express.Router();
const Products = require('./products.model');
const Reviews = require('../reviews/reviews.model');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const Seller=require('../sellers/seller.model');
router.post("/create-product",async(req,res)=>{
    temp={...req.body};
try{
   
    const seller_id=req.body.sellerId;
    try{
        const seller=await Seller.findById(seller_id);
        if (seller)
        {
            temp.seller=seller.username;
        }
        else
        {console.log(err,"no proper seller for this product");
            res.status(500).send({message:"failed to create new Product"});

        }
    }
    catch(err)
    {
        console.log(err,"no proper seller for this product");
        res.status(500).send({message:"failed to create new Product"});
    }
    const newProduct = new Products({
        ...temp
        })

    const savedProduct = await newProduct.save();
    const reviews = await Reviews.find({productId: savedProduct._id});
    if(reviews.length>0){
        const totalRating = reviews.reduce((acc,review)=> acc+ review.rating,0);
        const averageRating=totalRating/reviews.length;
        savedProduct.rating=averageRating;
        await savedProduct.save();
    }
    res.status(201).send(savedProduct);
}
catch(error){
    console.error("Error creating new Product",error);
    res.status(500).send({message:"Failed to create new Product",})
}
})

router.get("/",async(req,res)=>{
try{
    const {category,minPrice,maxPrice,page=1,limit=10}=req.query;
    let filter={};
    if(category && category!=='all'){
        filter.category=category;
    }
    if(minPrice && maxPrice){
        const min=parseFloat(minPrice);
        const max=parseFloat(maxPrice);
        if(!isNaN(min) && !isNaN(max)){
            filter.price={$gte:min, $lte:max};
        }
    }
    const skip=(parseInt(page)-1)*parseInt(limit);
    const totalProducts = await Products.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts/parseInt(limit));
    const products = await Products.find(filter)
                                .skip(skip)
                                .limit(parseInt(limit))
                                .populate(({ path: "sellerId", select: "email" }))
                                .sort({createdAt:-1});
    res.status(200).send({products,totalPages,totalProducts});                            
}
catch(error){
    console.error("Error fetching Products",error);
    res.status(500).send({message:"Error fetching Products",})
}
})

router.post('/search', async (req, res) => {
    const { search = '', page = 1, limit = 10 } = req.body;
    let filter = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } }, 
            { description: { $regex: search, $options: 'i' } } 
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Products.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    const products = await Products.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .populate({ path: 'sellerId', select: 'email' })
        .sort({ createdAt: -1 });

    res.status(200).send({ products, totalPages, totalProducts });
});
router.get('/trending', async (req, res) => {
    const { page = 1, limit = 8 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Products.find()
        .skip(skip)
        .limit(parseInt(limit))
        .populate({ path: 'sellerId', select: 'email' })
        .sort({ createdAt: -1 })
        .exec();

    const totalProducts = await Products.countDocuments();  // Get the total number of products
    res.status(200).send({ products, totalProducts });  // Send the products along with the total count
});


router.get('/categories/:categoryName', async (req, res) => {
    const { categoryName } = req.params;
    try {
        const products = await Products.find({ category: categoryName })
            .populate({ path: 'sellerId', select: 'email' })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).send({ products });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching products by category', error });
    }
});

router.get('/seller/:sellerId', async (req, res) => {
    const { sellerId,page,limit } = req.query;
    try {
        // const products = await Products.find({ sellerId: sellerID })
        //     .populate({ path: 'sellerId', select: 'email' })
        //     .sort({ createdAt: -1 })
        //     .exec();
        const skip=(parseInt(page)-1)*parseInt(limit);
        const totalProducts = await Products.countDocuments({ sellerId: sellerId });
        const totalPages = Math.ceil(totalProducts/parseInt(limit));
        const products = await Products.find({ sellerId: sellerId })
                                    .skip(skip)
                                    .limit(parseInt(limit))
                                    .populate(({ path: "sellerId", select: "email" }))
                                    .sort({createdAt:-1}).exec();
        res.status(200).send({products,totalPages,totalProducts}); 
        // res.status(200).send({ products });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching products by sellers', error });
    }
});

router.get("/:id",async(req,res)=>{
try{
    const productId=req.params.id;
    const product = await Products.findById(productId).populate(({ path: "sellerId", select: "email username" }));
    if(!product){
        res.status(404).send({message:"Product not found"}); 
    }
    const reviews=await Reviews.find({productId}).populate({
        path: "userId",
        select: "username email",
        });
    res.status(200).send({product,reviews});                            
}
catch(error){
    console.error("Error fetching the Product",error);
    res.status(500).send({message:"Failed to fetch the Product",})
}
})

router.patch("/update-product/:id",verifyToken,async(req,res)=>{
try{
    const productId=req.params.id;
    const updatedProduct = await Products.findByIdAndUpdate(productId,{...req.body},{new:true});
    if(!updatedProduct){
        res.status(404).send({message:"Product not found"}); 
    }
    res.status(200).send({message:"Product updated Successfully",product:updatedProduct})
}
catch(error){
    console.error("Error updating the product",error);
    res.status(500).send({message:"Failed to update the product",})
}
})

router.delete("/:id",async(req,res)=>{
try{
    const productId=req.params.id;
    const deletedProduct = await Products.findByIdAndDelete(productId);
    if(!deletedProduct){
    return res.status(404).send({message:'Product not found'})
    }
    await Reviews.deleteMany({productId:productId})
    res.status(200).send({message:"Product deleted Successfully",})
}
catch(error){
    console.log("Error Deleting the product",error);
    res.status(500).send({message:"Failed to Delete the product",})
}
})

router.get("/related/:id",async(req,res)=>{
try{
    const {id}=req.params;
    if(!id){
        return res.status(400).send({message:"Product ID is Required"});
    }
    const product = await Products.findById(id);
    if(!product){
        res.status(404).send({message:"Product not found"}); 
    }
    const titleRegex = new RegExp(
        product.name.split(" ").filter((word)=>word.length>1).join("|"),
        "i"
    )
    const relatedProducts = await Products.find({
        _id : {$ne:id},
        $or:[
            {name:{$regex:titleRegex}},
            {category:product.category},
        ]
    })
    res.status(200).send(relatedProducts);                            
}
catch(error){
    console.error("Error fetching the related Products",error);
    res.status(500).send({message:"Failed to fetch the related Products",})
}
})



module.exports = router;
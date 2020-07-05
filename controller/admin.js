const Product=require('../models/product')
const {validationResult}=require('express-validator')
exports.getAddProduct=(req,res,next)=>{
    res.render('admin/edit-product',
    {pageTitle:'add-product',
    path:'/admin/add-product',
    edit:false,
    isAuth:req.session.isLoggedIn,
    
})
}
exports.getEditProduct=(req,res,next)=>{
    const editMode=req.query.edit
    if(!editMode){
        res.redirect('/')
    }
    const productId=req.params.productId
    Product.findById(productId).then((product)=>{
        if(!product){
                    return res.redirect('/')
                }
                res.render('admin/edit-product',
                {pageTitle:'edit-product',
                path:'/admin/edit-product',
                edit:editMode,
                product:product,
                isAuth:req.session.isLoggedIn,
            
                
            })
    }).catch((error)=>{
        console.log(erro)
    })

}

exports.postEditProduct=(req,res,next)=>{
    const productId=req.body.productId
    const updatedtitle=req.body.title
    const image=req.file
    const updatedprice=req.body.price
    const updateddescription=req.body.description
    Product.findById(productId).then((product)=>{
        if(product.userId.toString()!==req.user._id.toString()){
            return res.redirect('/')
        }
        product.title=updatedtitle
        product.price=updatedprice
        product.description=updateddescription
        if(image){
            updatedimageurl=image.path
        }
        product.imageUrl=updatedimageurl
        return product.save().then(()=>{
            console.log('PRODUCT UPDATED!')
            res.redirect('/admin/products')
        })
    })
    .catch((error)=>{
        console.log(error)
    })
  

}
exports.productDelete=(req,res,next)=>{
    const productId=req.params.productId
    
    Product.deleteOne({_id:productId,userId:req.user._id})
    .then(()=>{
        console.log('PRODUCT DELETED!')
        res.status(200).json({message:'product Deleted'})
    }).catch((error)=>{
        res.status(500).json({message:'Deleting product faild!'})
    })
    
}
exports.postAddProduct=(req,res,next)=>{
    const title=req.body.title
    const image=req.file
    const price=req.body.price
    const description=req.body.description
   if(!image){

   }else{
    const imageUrl=image.path
    const product=new Product({
        title:title,
        price:price,
        description:description,
        imageUrl:imageUrl,
        userId:req.user
    })
    product.save()
    .then((result)=>{
        console.log('PRODUCT INSERTED!')
        res.redirect('/admin/products')
    }).catch((error)=>{
        console.log(error)
    })
    
   }
   
   
  
}

exports.getProducts=(req,res,next)=>{
    Product.find({userId:req.user._id}).then((products)=>{
        res.render('admin/products',
         {pageTitle:'Admin Products',
         prods:products,
         path:'/admin/products',
         isAuth:req.session.isLoggedIn})
    }).catch((error)=>{
        console.log(error)
    })
    
     
}
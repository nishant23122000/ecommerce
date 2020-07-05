const Product=require('../models/product')
const User=require('../models/user')
const Order=require('../models/order')
const stripe=require('stripe')('your key')
const PDFDocument=require('pdfkit')
const fs=require('fs')
const path=require('path')

const PRODUCT_PER_PAGE=2
// const ObjectId=require('mongodb').ObjectId
exports.getProducts=(req,res,next)=>{
   const page=+req.query.page || 1
    let totalItems
    Product.find().countDocuments().then((numberOfProducts)=>{
        totalItems=numberOfProducts
        return  Product.find()
        .skip((page-1)*PRODUCT_PER_PAGE)
        .limit(PRODUCT_PER_PAGE)
    })
   .then((products)=>{
        res.render('shop/product-list',
        {pageTitle:'shop',
        prods:products,
        productCSS:true,
        isAuth:req.session.isLoggedIn,
        page:page,
        currentPage:page,
        hasNext:PRODUCT_PER_PAGE*page<totalItems,
        hasPreviousPage:page>1,
        nextPage:page+1,
        previousPage:page-1,
        lastPage:Math.ceil(totalItems/PRODUCT_PER_PAGE),
        path:'/products'})
    }).catch((error)=>{
        console.log(error)
    })
    

}

exports.getProduct=(req,res,next)=>{
    const id=req.params.productId
    console.log(req.session.isLoggedIn)
    Product.findById(id).then((product)=>{

        res.render('shop/product-details',
        {product:product,
        pageTitle:product.title,
        path:'/all-product',
        isAuth:req.session.isLoggedIn
        })
    }).catch((error)=>{
        console.log(error)
    })
    
}   


exports.getIndex=(req,res,next)=>{
    const page=+req.query.page || 1
    let totalItems
    Product.find().countDocuments().then((numberOfProducts)=>{
        totalItems=numberOfProducts
        return  Product.find()
        .skip((page-1)*PRODUCT_PER_PAGE)
        .limit(PRODUCT_PER_PAGE)
    })
   .then((products)=>{
        res.render('shop/index',
        {pageTitle:'shop',
        prods:products,
        productCSS:true,
        isAuth:req.session.isLoggedIn,
        page:page,
        currentPage:page,
        hasNext:PRODUCT_PER_PAGE*page<totalItems,
        hasPreviousPage:page>1,
        nextPage:page+1,
        previousPage:page-1,
        lastPage:Math.ceil(totalItems/PRODUCT_PER_PAGE),
        path:'/products'})
    }).catch((error)=>{
        console.log(error)
    })
   
    
}

exports.getCart=(req,res,next)=>{
    req.user.populate('cart.items.productId').execPopulate().then((user)=>{
     
        let products=user.cart.items
        let totalPrice=user.cart.totalPrice
        console.log(products)
        res.render('shop/cart',{
                            'pageTitle':'your Cart',
                            'path':'/cart',
                            'products':products,
                            'totalPrice':totalPrice,
                            isAuth:req.session.isLoggedIn
                        })
    })
   }

exports.postCart=(req,res,next)=>{
    const id=req.body.productId
    console.log(id)
    Product.findById(id).then((product)=>{
        return req.user.addToCart(product)
    }).then((result)=>{
        res.redirect('/cart')
    }).catch((error)=>{
        console.log(error)
    })
}

exports.deleteFromCart=(req,res,next)=>{
    const productid=req.body.productId
    const price=req.body.price
    
    
    req.user.removeFromCart(productid,price).then((result)=>{
        res.redirect('/cart')
    })
    

}
exports.getCheckoutSuccess=(req,res,next)=>{
    req.user.addToOrders().then((result)=>{
        res.redirect('/cart')
    })
    
}
exports.getOrders=(req,res,next)=>{
   req.user.getOrders().then((orders)=>{
      
    res.render('shop/orders',{pageTitle:'Your Orders',path:'/orders',orders:orders,isAuth:req.session.isLoggedIn})
   })
//    .then((orders)=>{
       
    // 
//    })
    
}
exports.checkOut=(req,res,next)=>{
    let products;
    let total;
    let totalPrice
    req.user.populate('cart.items.productId').execPopulate().then((user)=>{
       
         products=user.cart.items
         totalPrice=user.cart.totalPrice
         total=0;
        products.forEach((product)=>{
            total+=product.quantity*product.productId.price 
        })
        return stripe.checkout.sessions.create({
            payment_method_types:['card'],
            line_items:products.map(p=>{
                return {
                    name:p.productId.title,
                    description:p.productId.description,
                    amount:p.productId.price*100,
                    currency:'usd',
                    quantity:p.quantity
                }
            }),
            success_url: req.protocol+'://'+req.get('host')+'/checkout/success',
            cancel_url:req.protocol+'://'+req.get('host')+'/checkout/cancel',
        }) 
       
    }).then((session)=>{
        res.render('shop/checkout',{
            'pageTitle':'Checkout',
            'path':'checkout',
            'products':products,
            'totalPrice':totalPrice,
            isAuth:req.session.isLoggedIn,
            totalSum:total,
            sessionId:session.id
        })
    })

}
    

exports.getInVoice=(req,res,next)=>{
    const orderId=req.params.orderId
    Order.findById(orderId).then((order)=>{
    
        if(!order){
            return next(new Error('mo order found'))
        }
   
          if(order.user.userId.toString()!==req.user._id.toString()){
            return next(new Error('un Authorized'))
        }
        const filename='invoice-'+orderId+'.pdf'
        const filePath=path.join(__dirname,'../','data','invoice',filename)
     
        const pdfDoc=new PDFDocument()
        res.setHeader('Content-Type','application/pdf')
        res.setHeader('Content-Disposition','inline;filename="nik.pdf"')
        
        pdfDoc.pipe(fs.createWriteStream(filePath))
        pdfDoc.pipe(res)
        pdfDoc.fontSize(26).text('invoice',{
            underline:true
        })
        pdfDoc.text('-----------------------------')
        let totalPrice=0
        order.product.forEach((product)=>{
            Product.findById(product.productId).then((pro)=>{
               
                pdfDoc.fontSize(14).text(pro.title+ ' - ' +product.quantity+'x'+'$'+pro.price)
                totalPrice+=product.quantity*pro.price
                pdfDoc.text('Total Price $:'+totalPrice)
                pdfDoc.text('Your Order is'+orderId)
                pdfDoc.end()
            })          
        })    
    }).catch((error)=>{
      console.log(error)
        // res.redirect('/500')
    })
    
   
    // const orderId=req.params.orderId
    // const inVoiceName='invoice-'+orderId+'.docx'
    // const invoicePath=path.join('data','invoice',inVoiceName)
    // fs.readFile(invoicePath,(err,data)=>{
    //     if(err){
    //         return next(err)
    //     }
    //     res.setHeader('Content-Type','application/docx')
    //     res.send(data)
    // })
}


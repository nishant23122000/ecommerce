const mongoose=require('mongoose')
const Order=require('../models/order')
const Schema=mongoose.Schema
const ObjectId=require('mongodb').ObjectId

const userSchema=new Schema({
        
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        resetToken:String,
        resetTokenExpireDate:Date,
        cart:{
            items:[
                {
                productId:{
                    type:Schema.Types.ObjectId,
                    ref:'Product',
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true
                }
            }
            ],
            totalPrice:{
                type:String,
                require:true
            }
        }
})
userSchema.methods.addToCart=function(product){
        
         let updatedCart=this.cart;
         let quantity=1
        
         if(updatedCart.items.length >0){
             const ProductIndex=this.cart.items.findIndex((pro)=>product._id.toString()===pro.productId.toString())
             if(ProductIndex>=0){
                    updatedCart.items[ProductIndex].quantity+=1
                 }else{
                    const newCart={'productId':product._id,'quantity':quantity}
                   
                    updatedCart.items.push(newCart)
             }
             updatedCart.totalPrice=(parseFloat(updatedCart.totalPrice)+parseFloat(product.price)).toString()
         }else{
            
            updatedCart={'items':[{'productId':product._id,'quantity':quantity}],'totalPrice':product.price.toString()}
          }
        
      this.cart=updatedCart
      return this.save()
      }

userSchema.methods.removeFromCart=function(productId,price){
   
    const updatedCart=this.cart.items.filter((p)=>p._id.toString()!==productId.toString())
   updatedPrice=parseFloat(this.cart.totalPrice)-parseFloat(price)
    this.cart={'items':updatedCart,'totalPrice':updatedPrice}
    return this.save()
}

userSchema.methods.addToOrders=function(){
    
const orderData={
    product:this.cart.items,
    user:{
        userId:this._id,
        email:this.email
    }
}
const order=new Order(orderData)
return order.save().then((data)=>{
    this.cart={items:[]}
    this.save()
})

}

userSchema.methods.getOrders=function(){
   return Order.find({'user.userId':this._id}).select('product').populate('product.productId').then((result)=>{
       
    return result
    })
}
module.exports=mongoose.model('User',userSchema)

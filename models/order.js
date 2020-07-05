const mongoose=require('mongoose')

const Schema=mongoose.Schema

const orderSchema=new Schema({
   
        product: [
          {
                productId:{
                     type:Schema.Types.ObjectId,
                     ref:'Product'
                 },
                 quantity:{
                        type:Number,
                       required:true
                  }
            

         }
        ],
    
    user:{
        userId:{
            type:Schema.Types.ObjectId,
            ref:'User'     
        },
        email:{
            type:String,
            required:true
        }
       
    }
    
})



module.exports=mongoose.model('Order',orderSchema)


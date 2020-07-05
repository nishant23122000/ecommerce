const mongoose=require('mongoose')

const Schema=mongoose.Schema

const productSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

module.exports=mongoose.model('Product',productSchema)

// const getDb=require('../utils/database').getDb
// const ObjectId=require('mongodb').ObjectId
// module.exports=class Product{
//     constructor(title,price,description,imageUrl,id,userId){
//         this.title=title
//         this.price=price
//         this.description=description
//         this.imageUrl=imageUrl
//         this._id=id ? new ObjectId(id) : null
//         this.userId=userId
//     }
//     save(){
//         const db=getDb()
//         let dbOp;
//         if(this._id){
//             dbOp=db.collection('products').updateOne({_id:this._id},{$set:this})
//         }else{
//             dbOp=db.collection('products').insertOne(this)
//         }
      
//       return  dbOp.then((result)=>{
//           console.log(result)
//             return result
//         }).catch((error)=>{
//             console.log(error)
//         })
//     }
    
//     static fetchAll(cb){
//         const db=getDb()
            
//        return  db.collection('products').find().toArray().then((products)=>{
//             return products
//         }).catch((error)=>{
//             console.log(error)
//         })

//     }
//     static findById(id){
//         console.log(id)
//         const db=getDb()
//        return db.collection('products').find({_id:new ObjectId(id)}).next().then((result)=>{
//             return result
//         }).catch((error)=>{
//             console.log(error)
//         })
//     }
//     static deleteById(id){
//         const db=getDb()
//         return db.collection('products')
//         .deleteOne({_id:new ObjectId(id)})
//         .then(()=>{
//             console.log('DELETED !')
//         })
//         .catch((error)=>{
//             console.log(error)
//         })
//     }
    
// }


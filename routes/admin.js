
const express=require('express')
// const path=require('path')
const isAuth=require('../middleware/is_auth')
const router=express.Router()
const {check}=require('express-validator')
const adminController=require('../controller/admin')

router.get('/add-product',isAuth,adminController.getAddProduct)
router.get('/edit-product/:productId',isAuth,adminController.getEditProduct)
router.get('/products',isAuth,adminController.getProducts)

router.post('/product',isAuth,adminController.postAddProduct)
router.post('/edit-product',isAuth,adminController.postEditProduct)
router.delete('/product/:productId',isAuth,adminController.productDelete)
module.exports=router
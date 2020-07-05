const express=require('express')
// const path=require('path')
const isAuth=require('../middleware/is_auth')

const router=express.Router()
const adminData=require('./admin')
const shopController=require('../controller/shop')


router.get('/',shopController.getIndex)
router.get('/products',shopController.getProducts)
router.get('/products/:productId',shopController.getProduct)
router.get('/cart',isAuth,shopController.getCart)
router.post('/cart',isAuth,shopController.postCart)
router.post('/cart-delete',isAuth,shopController.deleteFromCart)

router.get('/orders',isAuth,shopController.getOrders)
router.get('/order/:orderId',isAuth,shopController.getInVoice)
router.get('/checkout',shopController.checkOut)
router.get('/checkout/success',shopController.getCheckoutSuccess)
router.get('/checkout/cancel',shopController.checkOut)

module.exports=router
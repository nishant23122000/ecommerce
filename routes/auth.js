const express=require('express')
const authController=require('../controller/auth')
const {check}=require('express-validator')
const User=require('../models/user')
const router=express.Router()

router.get('/login',authController.getLogin)
router.post('/login',[
    check('email','Enter a valid email address').isEmail(),

],authController.postLogin)
router.get('/logout',authController.logOut)
router.get('/signup',authController.getSignUp)
router.post('/signup',[
    check('email','Please Enter a valid email').isEmail().custom((val,{req})=>{
        return User.findOne({email:val}).then((userDoc)=>{
            if(userDoc){
                return Promise.reject('Email Id already exist,try another')
            }
        })
    }),

    check('confirmPassword').custom((val,{req})=>{
        if(val!==req.body.password){
            throw new Error('password have to match!')
        }
        return true
    })

],authController.postSignUp)
router.get('/reset',authController.getReset)
router.post('/reset',authController.postReset)
router.get('/reset/:token',authController.getNewPassword)
router.post('/new_password',authController.postNewPassword)
module.exports=router
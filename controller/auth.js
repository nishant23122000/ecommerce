const User=require('../models/user')
const bcrypt=require('bcryptjs')
const nodeMailer=require('nodemailer')
const {validationResult}=require('express-validator')
// const nodeSendGridTransport=require('nodemailer-sendgrid-transport')
const crypto=require('crypto')
const transport=nodeMailer.createTransport({
    service:'gmail',
    auth:{
        user:'email',
        pass:'password'             
    }
})
exports.getSignUp=(req,res,next)=>{
    res.render('auth/signup',{
        pageTitle:'signup',
        path:'/signup',
        isAuth:req.session.isLoggedIn,
        errorMsg:req.flash('popup'),
        oldInput:{
            'email':'',
            'password':'',
            'confirmPassword':''
        },
        validationError:[]
    })
}
exports.postSignUp=(req,res,next)=>{
    const email=req.body.email
    const password=req.body.password
   const confirmPassword=req.body.confirmPassword
   const error=validationResult(req)
   console.log(error)
   if(!error.isEmpty()){
   return  res.status(422).render('auth/signup',{
        pageTitle:'signup',
        path:'/signup',
        isAuth:req.session.isLoggedIn,
        errorMsg:error.array()[0].msg,
        oldInput:{
            'email':email,
            'password':password,
            'confirmPassword':confirmPassword
        },
        validationError:error.array()
        

    })
   }
    bcrypt
        .hash(password,12)
        .then((hashedPassword)=>{
            const user=User({
                email:email,
                password:hashedPassword,
                cart:{items:[]}
            })
            return user.save()
       
        }).then(()=>{
            req.flash('popup','Successfuly Siggned In')
            res.redirect('/login')
            return transport.sendMail({
                from:'email',
                to:email,
                subject:'Signup Succeeded!',
                text:'you Successfully signed up'

            }).catch((err)=>{
                console.log(err)
            })
        
    })
    
        .catch((error)=>{
        console.log(error)
    })
}
exports.getLogin=(req,res,next)=>{
  
    res.render('auth/login',{
        pageTitle:'login',
        path:'/login',
        isAuth:req.session.isLoggedIn,
        errorMsg:req.flash('popup'),
        oldInput:{
            'email':'',
           'password':'' 
        },
        validationError:[]
    })
}

exports.postLogin=(req,res,next)=>{

const email=req.body.email
const password=req.body.password
const errors=validationResult(req)
if(!errors.isEmpty()){
    return res.render('auth/login',{
        pageTitle:'login',
        path:'/login',
        isAuth:req.session.isLoggedIn,
        errorMsg:errors.array()[0].msg,
        oldInput:{
            'email':email,
            'password':password
        },
        validationError:errors.array()        
    })
}
User.findOne({email:email}).then((user)=>{
    console.log(user)
    if(!user){
       
        req.flash('popup','User have a no account')
        return res.redirect('/signup')
    }
    bcrypt.compare(password,user.password).then((isMatch)=>{
        console.log(isMatch)
        if(isMatch){
            
            req.session.isLoggedIn=true
            req.session.user=user
            return req.session.save((err)=>{
                console.log(err)
                res.redirect('/')
            })
            
        }
        req.flash('popup','Either email or password incorrect!😢')
        res.redirect('/login')

    }).catch((error)=>{
        console.log(error)
        res.redirect('/signup')
    })
})

}

exports.logOut=(req,res,next)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
}

exports.getReset=(req,res,next)=>{
    
    res.render('auth/reset',{
        pageTitle:'reset',
        path:'/signup',
        errorMsg:req.flash('popup')
    })
}

exports.postReset=(req,res,next)=>{
    const email=req.body.email
    crypto.randomBytes(32,(err,buffor)=>{
        if(err){
            console.log(err)
            return res.redirect('/reset')
        }
        const token=buffor.toString('hex')
        console.log(token)
        User.findOne({email:email}).then((user)=>{
            if(!user){
                req.flash('popup','No account found, check your email!')
                return res.redirect('/reset')

            }
            user.resetToken=token,
            user.resetTokenExpireDate=Date.now()+3600000
            return user.save()
        }).then(()=>{
            req.flash('popup','check Your email box')
            res.redirect('/login')
            return transport.sendMail({
                from:'email',
                to:email,
                subject:'reset password!',
                html:'<p>You requested to password reset</p><p>click the <a href="http://localhost:3000/reset/'+token+'">link</a> link to reset</p>'

            }).catch((err)=>{
                console.log(err)
            })
        }).catch((error)=>{
            console.log(err)
        })
    })
}

exports.getNewPassword=(req,res,next)=>{
    const token=req.params.token
    User.findOne({resetToken:token,resetTokenExpireDate:{$gt:Date.now()}}).then((user)=>{
        res.render('auth/new_password',{
            pageTitle:'new_pass',
            path:'/signup',
        
            errorMsg:req.flash('popup'),
            userId:user._id.toString(),
            token:token
        })
    }).catch((error)=>{
        console.log(error)
    })
    
}

exports.postNewPassword=(req,res,next)=>{
    const userId=req.body.userId
    const token=req.body.token
    const password=req.body.password
    console.log(token)
    console.log(userId)
    console.log(password)
    let resetUser;
    User.findOne({
        _id:userId,
        resetToken:token,
        resetTokenExpireDate:{$gt:Date.now()}})
        .then((user)=>{
           
            resetUser=user
             return bcrypt.hash(password,12)
        }).then((hashedPassowrd)=>{
            console.log(resetUser)
            resetUser.password=hashedPassowrd
            resetUser.resetToken=undefined
            resetUser.resetTokenExpireDate=undefined
            return resetUser.save()
        }).then(()=>{
            req.flash('popup','password changed successfully😉')
            res.redirect('/login')
        }).catch((error)=>{
            console.log(error)
        })
}
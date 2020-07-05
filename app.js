const express=require('express')
const mongoose=require('mongoose')
const path=require('path')
const session=require('express-session')
const MongoServer=require('connect-mongodb-session')(session)
const csrf=require('csurf')
const flash=require('connect-flash')
const multer=require('multer')

const bodyparser=require('body-parser')
const MONGODB_URL='put your MongoDB URl'

const app=express()
const store=new  MongoServer({
    uri:MONGODB_URL,
    collection:'sessions'
})
const csrfProtection=csrf()

const User=require('./models/user')

const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null,new Date().toISOString().replace(/:/g, '-')+'-'+file.originalname)
    }
})
const filter=(req,file,cb)=>{
    if(file.mimetype==='image/jpg' ||
     file.mimetype==='image/jpeg' || 
     file.mimetype==='image/png')
    {
        cb(null,true)
    }else{
        cb(null,false)
    }
}

app.set('view engine','ejs')
app.set('views','views')

const adminRoutes=require('./routes/admin')
const shopRoutes=require('./routes/shop')
const authRoutes=require('./routes/auth')


const errorController=require('./controller/error')


app.use(bodyparser.urlencoded({ extended: true}))
app.use(multer({storage:fileStorage,fileFilter:filter}).single('image'))

app.use(express.static(path.join(__dirname,'public')))
app.use('/images',express.static(path.join(__dirname,'images')))
app.use(session({secret:'nishant patel',resave:false,saveUninitialized:false,store:store}))
app.use(csrfProtection)
app.use(flash())
app.use((req,res,next)=>{
    if(!req.session.user){
       return next()
    }
    User.findOne(req.session.user._id).then((user)=>{
        req.user=user
        next()

    })
})
app.use((req,res,next)=>{
    res.locals.isAuth=req.session.isLoggedIn
    res.locals.csrfToken=req.csrfToken()
    next()
})
app.use('/admin',adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)
app.get('/500',errorController.get500Page)
app.use(errorController.get4040Page)
mongoose.connect(MONGODB_URL,{useNewUrlParser:true,useUnifiedTopology:true}).then((result)=>{
    
     app.listen(3000,()=>{
        console.log('server started on port 3000!')
    })
}).catch((error)=>{
    console.log(error)
})





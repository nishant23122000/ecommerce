exports.get4040Page=(req,res,next)=>{
    res.status(404).render('404',{pageTitle:'page not found',path:'error',isAuth:req.session.isLoggedIn})
}

exports.get500Page=(req,res,next)=>{
    res.status(500).render('500',{
        pageTitle:'Error',
        path:'500',
        isAuth:req.session.isLoggedIn
    })
}
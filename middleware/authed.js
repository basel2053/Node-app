module.exports = (req,res,next)=>{
    if (req.session.isLoggedIn || req.session.isUserLoggedIn){
        return res.redirect('/');
    }
    next();
};
module.exports = (req,res,next)=>{
    if (!req.session.isUserLoggedIn){
        return res.redirect('/404');
    }
    next();
};
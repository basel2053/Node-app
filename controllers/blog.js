const axios = require('axios');
const fileHelper = require('../util/file');
const {validationResult} = require('express-validator');

exports.getBlog = async (req,res,next)=>{
    try{

    let response;
    const author = req.query.user;
        response = await axios.get(`https://e-blog-api.herokuapp.com/api/post${author?'?user=':''}${author?author:''}`);
    let posts=[];
    let createDate=[];
    for(let i =0;i<response.data.length;i++)
    {
        posts.push(response.data[i]);
        createDate.push(new Date (response.data[i].createdAt).toDateString());
    }
    
    res.render('blog/main',{
        title:author?`${author} Posts`:'Blog',
        path:'/blog',
        posts:posts,
        createDate:createDate
    })
    } catch(err){
        res.status(500).redirect('/500');
    }

};

exports.createPost = async(req,res,next)=>{
    try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        try{
            return res.status(422).render('blog/write',{
            title: "Create Post",
            path: '/create/post',
            editPost:false,
            hasError: true,
            post:{
                title:req.body.title,
                description:req.body.description
            },
            errorMessage: errors.array()[0].msg
        });
    }catch (err){res.status(500).redirect('/500'); }
    } 
    
    await axios.post('https://e-blog-api.herokuapp.com/api/post', {
    username:req.session.user.username,
    title: req.body.title,
    description: req.body.description,
    photo:req.file? req.file.path : null
  })
  .then(res.redirect('/blog'))
  }catch (err){ const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); }
};

exports.delPost = async(req,res,next)=>{
    try{

        await axios.delete(`https://e-blog-api.herokuapp.com/api/post/${req.body.postId}`,{data:
        {username:req.body.username}})
        .then(res.redirect('/blog'))
        if(req.body.postPhoto){
            
            fileHelper.deleteFile(req.body.postPhoto);
        }
    }catch(err){const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);}
};

exports.getEditPost = async(req,res,next)=>{
    try{
    const editPost = req.query.editPost;
    if(!editPost){
        try{
            return res.redirect('/blog');
        }catch(err){
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
    }
    const response = await axios.get(`https://e-blog-api.herokuapp.com/api/post/${req.params.postId}`);
    const post = response.data;
    await res.render('blog/write',{
        title:'Edit Post',
        path:'/post/edit',
        post:post,
        editPost:editPost,
        hasError:false,
        errorMessage:null
    })
    }catch(err){
        res.status(500).redirect('/500');
    }
};

exports.postEditPost = async(req,res,next)=>{
    try{
    const postId = req.body.postId;
    const updatedTitle = req.body.title;
    const updatedDescription = req.body.description;
    const image = req.file;
    const username = req.body.username;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        try{
            return res.status(422).render('blog/write',{
            title: "Edit Post",
            path: '/edit/post',
            editPost:true,
            hasError: true,
            post:{
                title:updatedTitle,
                description:updatedDescription,
                _id:postId
            },
            errorMessage: errors.array()[0].msg
        });
    }catch (err){res.status(500).redirect('/500'); }
    }
    if(image){
        fileHelper.deleteFile(req.body.postPhoto);
    }
    await axios.put(`https://e-blog-api.herokuapp.com/api/post/${postId}`,{
        username:username,
        title:updatedTitle,
        description:updatedDescription,
        photo:image?image.path:undefined
    }).then(res.redirect('/blog'))
    } catch(err){
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getPost = async(req,res,next)=>{
    try{
    const response = await axios.get(`https://e-blog-api.herokuapp.com/api/post/${req.params.postId}`);
    const post = response.data;
    res.render('blog/post',{
        title:post.title,
        path:'/blog/post',
        post:post
    })
    } catch(err){res.status(500).redirect('/500');}
};

exports.getCreatePost = async(req,res,next)=>{
    try{
    await res.render('blog/write',{
        title:'Create Post',
        path:'/create/post',
        editPost:false,
        hasError:false,
        errorMessage:null
    })
    }catch(err){res.status(500).redirect('/500');}
};

// Auth

exports.getRegister = async(req,res,next)=>{
    try{
        
    res.render('blog/register',{
        title:'Register',
        path:'/blog/register',
        oldInputs:{
            username:'',
            email:'',
            password:''
        },
        errorMessage:null
    })
    }catch(err){res.status(500).redirect('/500');}
};

exports.postRegister = async(req,res,next)=>{
    try{
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        if(!errors.isEmpty()){
        try{
            return res.status(422).render('blog/register',{
            title: "Register",
            path: '/blog/register',
            oldInputs:{
                username:username,
                email:email,
                password:''
            },
            errorMessage: errors.array()[0].msg
        });
    }catch (err){res.status(500).redirect('/500'); }
    }
    await axios.post('https://e-blog-api.herokuapp.com/api/auth/register', {
    username: username,
    email:email,
    password:password
  })
  .then(res.redirect('/blog/login'))
    }catch(err){
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


exports.getLogin= async(req,res,next)=>{
    res.render('blog/login',{
        title:'Login',
        path:'/blog/login',
        errorMessage: null,
        oldInputs:{
            email:'',
            password:''
        }
    })
};

exports.postLogin = async(req,res,next)=>{
    try{
    const errors = validationResult(req);
        if(!errors.isEmpty()){
        try{
            return res.status(422).render('blog/login',{
            title: "Login",
            path: '/blog/login',
            oldInputs:{
                email:req.body.email,
                password:''
            },
            errorMessage: errors.array()[0].msg
        });
    }catch (err){res.status(500).redirect('/500'); }
    }
    const user = await axios.post('https://e-blog-api.herokuapp.com/api/auth/login',{
    email: req.body.email,
    password:req.body.password
    }).catch(err=>{
        if(err.response.data == 'Invalid password'){
            try{
            return res.status(422).render('blog/login',{
            title: "Login",
            path: '/blog/login',
            oldInputs:{
                email:req.body.email,
                password:''
            },
            errorMessage: 'Invalid email or password.'
        });
        }catch (err){res.status(500).redirect('/500'); }
        }
    })
    req.session.isUserLoggedIn = true;
    req.session.user=user.data;
    return req.session.save((err)=>{
        res.redirect('/');
        });
    } catch(err){
        
    }

};

exports.postLogout = async(req,res,next)=>{
    try{
        await req.session.destroy(err =>{
            res.redirect('/');
        });
    } catch(err){
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

// USER

exports.getUser = async(req,res,next)=>{
    try{
    const [userResponse,postResponse]= await axios.all([
  axios.get(`https://e-blog-api.herokuapp.com/api/user/${req.params.username}`), 
  axios.get(`https://e-blog-api.herokuapp.com/api/post?user=${req.params.username}`)
]);
    const user = userResponse.data;
    const posts = postResponse.data;
    res.render('blog/profile',{
        title:`${user.username} | Profile`,
        path:'/blog/profile',
        user:user,
        posts:posts
    });
    } catch(err){res.status(500).redirect('/500'); }
};

exports.getSettings = async(req,res,next)=>{
    try{
        res.render('blog/settings',{
            title:`${req.session.user.username} | Settings `,
            path:'blog/settings',
            errorMessage: null,
            oldInputs:{
                username:req.session.user.username,
                email:req.session.user.email,
                password:''
            },
        })
    } catch(err){{res.status(500).redirect('/500'); }}
};

exports.postSettings = async(req,res,next)=>{
    try{

    const userId = req.body.userId;
    const currentUsername = req.body.currentUsername;
    const updatedUsername = req.body.username;
    const updatedEmail = req.body.email;
    const updatedPassword = req.body.password;
    const image = req.file;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        try{
            return res.status(422).render('blog/settings',{
            title:`${req.session.user.username} | Settings `,
            path:'blog/settings',
            oldInputs:{
                username:updatedUsername,
                email:updatedEmail,
                password:''
            },
            errorMessage: errors.array()[0].msg
        });
    }catch (err){res.status(500).redirect('/500'); }
    }
    req.session.user.username = updatedUsername; 
    req.session.user.email = updatedEmail; 
    if (image && req.session.user.profilePicture.includes('images') ){
        fileHelper.deleteFile(req.session.user.profilePicture);
    }
    if(image){
        req.session.user.profilePicture = image.path;
    }
    await axios.put(`https://e-blog-api.herokuapp.com/api/user/${userId}`,{
        userId:userId,
        currentUsername:currentUsername,
        username:updatedUsername,
        email:updatedEmail,
        password:updatedPassword?updatedPassword:undefined,
        profilePicture:image?image.path:undefined
    }).then(res.redirect(`/blog/user/${updatedUsername}`))
        
    }catch(err){
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.delUser=async(req,res,next)=>{
    try{
    await axios.delete(`https://e-blog-api.herokuapp.com/api/user/${req.params.userId}`,
    {data:{userId:req.body.userId}})
    await req.session.destroy(err =>{
        res.redirect('/');
    });
    } catch(err){
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
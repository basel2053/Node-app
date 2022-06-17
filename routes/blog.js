const express = require('express');
const axios = require('axios');

const blogController = require('../controllers/blog');

const  {body,check} = require('express-validator');

const router = express.Router();

const isUser = require('../middleware/is-user');
const authed = require('../middleware/authed');

// GET BLOG
router.get('/',isUser,blogController.getBlog);

// GET CREATE POST
router.get('/write',isUser,blogController.getCreatePost);

// CREATE POST
router.post('/post',[body('title','Please Enter a title with maximum of 40 characters.').isString().isLength({min:1,max:40}).trim(),
body('description','Please enter description between 16-2000 characters.').isLength({min:16,max:2000}).trim()],
isUser,blogController.createPost);

// DELETE POST
router.post('/delpost',isUser,blogController.delPost);

// GET EDIT POST
router.get('/edit-post/:postId',isUser,blogController.getEditPost);

// POST EDIT POST
router.post('/edit-post',[body('title','Please Enter a title with maximum of 40 characters.').isString().isLength({min:1,max:40}).trim(),
body('description','Please enter description between 16-2000 characters.').isLength({min:16,max:2000}).trim()],isUser,blogController.postEditPost);

// GET SINGLE POST
router.get('/post/:postId',isUser,blogController.getPost);

// GET USER
router.get('/user/:username',isUser,blogController.getUser);

// GET SETTINGS
router.get('/settings',isUser,blogController.getSettings);

// UPDATE USER
router.post('/settings',[
    body('username').isAlphanumeric().isLength({min:4,max:24}).withMessage('Username has to be alphanumeric and 4-24 characters.').custom(async(value,{req})=>{
        const response = await axios.get(`https://e-blog-api.herokuapp.com/api/user/${value}`)
        .catch(err=>{});
        if(value ==req.session.user.username){

        } else if(response)
        {
            return Promise.reject(`Username already exists.`)
        }
}),
    body('email').isEmail().withMessage('Please enter a valid email.').custom(async(value,{req})=>{
        const response = await axios.get(`https://e-blog-api.herokuapp.com/api/user/${value}`)
        .catch(err=>{});
        if(value ==req.session.user.email){

        } else if(response)
        {
            return Promise.reject(`Email already exists.`)
        }
}).normalizeEmail(),

body('password','Please Enter a password with only alphanumeric and 6-16 characters.').optional({checkFalsy: true}).isLength({min:6,max:16}).isAlphanumeric().trim()],isUser,blogController.postSettings)

// DELETE USER
router.post('/user/:userId',isUser,blogController.delUser);

// GET REGISTER
router.get('/register',isUser,blogController.getRegister);

// CREATE ACCOUNT
router.post('/register',[
    body('username').isAlphanumeric().isLength({min:4,max:24}).withMessage('Username has to be alphanumeric and 4-24 characters.').custom(async(value,{req})=>{
        const response = await axios.get(`https://e-blog-api.herokuapp.com/api/user/${value}`)
        .catch(err=>{});
        if(response){
            return Promise.reject('Username already exists.')
        }
}),
    body('email').isEmail().withMessage('Please enter a valid email.').custom(async(value,{req})=>{
        const response = await axios.get(`https://e-blog-api.herokuapp.com/api/user/${value}`)
        .catch(err=>{});
        if(response){
            return Promise.reject('Email already exists.')
        }
}).normalizeEmail(),

body('password','Please Enter a password with only alphanumeric and 6-16 characters.').isLength({min:6,max:16}).isAlphanumeric().trim()],isUser,blogController.postRegister);

// GET LOGIN
router.get('/login',authed,blogController.getLogin);

// POST LOGIN
router.post('/login',[body('email').isEmail().withMessage('Please enter a valid email address.').custom(async(value,{req})=>{
        const response = await axios.get(`https://e-blog-api.herokuapp.com/api/user/${value}`)
        .catch(err=>{});
        if(!response){
            return Promise.reject('Invalid email or password.')
        }
}).normalizeEmail(),
body('password','Password has to be valid and 6-16 characters.').isLength({min:6,max:16}).isAlphanumeric().trim()],authed,blogController.postLogin);

// POST LOGOUT
router.post('/logout',isUser,blogController.postLogout)

module.exports=router;
const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');
const authed = require('../middleware/authed');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authed, authController.getLogin);
router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email address.')
			.normalizeEmail(),
		body('password', 'Password has to be valid and 6-16 characters.')
			.isLength({ min: 6, max: 16 })
			.isAlphanumeric()
			.trim(),
	],
	authController.postLogin
);

router.post('/logout', isAuth, authController.postLogout);

router.get('/signup', isAuth, authController.getSignup);
router.post(
	'/signup',
	[
		check('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then(userDoc => {
					if (userDoc) {
						return Promise.reject('E-mail exists already.');
					}
				});
			})
			.normalizeEmail(),
		body(
			'password',
			'Please Enter a password with only alphanumeric and 6-16 characters.'
		)
			.isLength({ min: 6, max: 16 })
			.isAlphanumeric()
			.trim(),
		body('confirmPassword')
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Password have to match!');
				}
				return true;
			})
			.trim(),
	],
	isAuth,
	authController.postSignup
);

router.get('/reset', isAuth, authController.getReset);
router.post(
	'/reset',
	check('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
	isAuth,
	authController.postReset
);

router.get('/reset/:token', isAuth, authController.getNewPassword);
router.post('/new-password', isAuth, authController.postNewPassword);

module.exports = router;

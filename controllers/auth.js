const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../util/sendemail');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv').config();

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/login', {
		path: '/login',
		title: 'Login',
		errorMessage: message,
		oldInputs: {
			email: '',
			password: '',
		},
		validationErrors: [],
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/login', {
			path: '/login',
			title: 'Login',
			errorMessage: errors.array()[0].msg,
			oldInputs: {
				email: email,
			},
			validationErrors: errors.array(),
		});
	}
	User.findOne({ email: email })
		.then(user => {
			if (!user) {
				return res.status(422).render('auth/login', {
					path: '/login',
					title: 'Login',
					errorMessage: 'Invalid email or password.',
					oldInputs: {
						email: email,
					},
					validationErrors: [],
				});
			}
			bcrypt
				.compare(password + process.env.PEPPER, user.password)
				.then(doMatch => {
					// compare returns true or false
					if (doMatch) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save(err => {
							res.redirect('/');
						});
					}
					return res.status(422).render('auth/login', {
						path: '/login',
						title: 'Login',
						errorMessage: 'Invalid email or password.',
						oldInputs: {
							email: email,
						},
						validationErrors: [],
					});
				})
				.catch(err => {
					console.log(err);
					return res.redirect('/login');
				});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(err => {
		res.redirect('/');
	});
};

exports.getSignup = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/signup', {
		title: 'Sign up',
		path: '/signup',
		errorMessage: message,
		oldInputs: {
			email: '',
			password: '',
			confirmPassword: '',
		},
		validationErrors: [],
	});
};
exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('auth/signup', {
			// 422 indicating that validation failed
			title: 'Sign up',
			path: '/signup',
			errorMessage: errors.array()[0].msg,
			oldInputs: {
				email: email,
				password: password,
				confirmPassword: req.body.confirmPassword,
			},
			validationErrors: errors.array(),
		});
	}

	bcrypt
		.hash(password + process.env.PEPPER, parseInt(process.env.SALT_ROUNDS))
		.then(hashedPassword => {
			const user = new User({
				email: email,
				password: hashedPassword,
			});
			return user.save();
		})
		.then(result => {
			res.redirect('/login');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getReset = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/reset', {
		title: 'Reset Password',
		path: '/reset',
		errorMessage: message,
	});
};

exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/reset');
		}
		const token = buffer.toString('hex');
		User.findOne({ email: req.body.email })
			.then(user => {
				if (!user) {
					req.flash('error', 'No account with that email found.');
					return res.redirect('/reset');
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				user.save();
				res.redirect('/');
				const to = 'baselsalah2053@gmail.com';
				// const to = req.body.email;
				const from = 'ogswebproject@gmail.com';
				const subject = 'Password reset';
				const output = `
        <p>You requested a password reset</p>
        <p>Click this <a href="https://eniweb.herokuapp.com/${token}">link</a> to set a new password.</p>
        `;
				sendEmail(to, from, subject, output);
			})
			.catch(err => {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			});
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
		.then(user => {
			let message = req.flash('error');
			if (message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}
			res.render('auth/new-password', {
				title: 'Update Password',
				path: '/new-password',
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;

	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then(user => {
			resetUser = user;
			return bcrypt.hash(
				newPassword + process.env.PEPPER,
				parseInt(process.env.SALT_ROUNDS)
			);
		})
		.then(hashedPassword => {
			resetUser.password = hashedPassword;
			resetUser.resetToken = undefined;
			resetUser.resetTokenExpiration = undefined;
			return resetUser.save();
		})
		.then(result => {
			res.redirect('/');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

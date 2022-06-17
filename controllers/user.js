const Project = require('../models/project');
const sendEmail = require('../util/sendemail');
const { validationResult } = require('express-validator');

exports.getHome = (req, res, next) => {
	Project.find() // used find without cursor cause we won't query large amounts of data
		.then(projects => {
			res.render('user/home', {
				title: 'Home',
				path: '/',
				projs: projects,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProject = (req, res, next) => {
	// const page = req.query.page;
	const projId = req.params.projectId;
	Project.findById(projId).then(project => {
		res.render('user/project-detail', {
			project: project,
			title: project.title,
			path: '/',
		});
	});
};

exports.getAboutUs = (req, res, next) => {
	res.render('user/about-us', {
		title: 'About-ENI',
		path: '/about-us',
	});
};
exports.getSustDev = (req, res, next) => {
	Project.find()
		.then(projects => {
			res.render('user/sust-development', {
				title: 'Sustainable-Development',
				path: '/sust-dev',
				projs: projects,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getContact = (req, res, next) => {
	res.render('user/contact', {
		title: 'Contacts',
		path: '/contact',
		errorMessage: '',
		hasError: false,
	});
};
exports.postContact = (req, res, next) => {
	const { name, surname, email, Subject, description } = req.body;

	const from = 'ogswebproject@gmail.com'; // the email we used for sendgrid verfication
	const to = 'baselsalah2053@gmail.com';
	const subject = Subject;
	const output = `
<h2>Contact Details</h2>
<ul>
<li>Name : ${name} ${surname}</li>
<li>E-mail : ${email}</li>
<li>Description : ${description}</li>
</ul>
`;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('user/contact', {
			// 422 indicating that validation failed
			title: 'Contacts',
			path: '/contact',
			message: {
				name: name,
				surname: surname,
				email: email,
				subject: Subject,
				desc: description,
			},
			hasError: true,
			errorMessage: errors.array()[0].msg,
		});
	}
	sendEmail(to, from, subject, output);
	res.redirect('/sent');
};

exports.getSent = (req, res, next) => {
	res.render('user/sent', {
		title: 'Email Sent',
		path: '/sent',
	});
};

const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const userController = require('../controllers/user');

router.get('/', userController.getHome);
router.get('/project/:projectId', userController.getProject);
router.get('/about-us', userController.getAboutUs);
router.get('/sust-dev', userController.getSustDev);
router.get('/contact', userController.getContact);
router.post(
	'/contact',
	[
		body('name').isString().withMessage('Please enter your name.'),
		check('email').isEmail().withMessage('Please enter a vaild email.'),
		check('description', 'Please enter a message.').notEmpty(),
	],
	userController.postContact
);
router.get('/sent', userController.getSent);
router.get('/resources', userController.getResources);

module.exports = router;

const Project = require('../models/project');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

exports.getProjects = (req, res, next) => {
	Project.find() // find(userId:req.user._id) only shows the project this user created or (specfied id) to allow only 1 to view admin projects
		// .populate('userId','name -_id') // to get the name of the user who created the project
		.then(projects => {
			res.render('admin/projects', {
				projs: projects,
				title: 'Admin Projects',
				path: '/admin/projects',
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getAddProject = (req, res, next) => {
	res.render('admin/edit-project', {
		title: 'Add-Project',
		path: '/admin/edit-project',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: [],
	});
};

exports.postAddProject = (req, res, next) => {
	const title = req.body.title;
	const image = req.file;
	const category = req.body.category;
	const area = req.body.area;
	const description = req.body.description;
	if (!image) {
		return res.status(422).render('admin/edit-project', {
			title: 'Add-Project',
			path: '/admin/edit-project',
			editing: false,
			hasError: true,
			project: {
				title: title,
				description: description,
			},
			errorMessage: 'Attached file is not an image.',
			validationErrors: [],
		});
	}
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-project', {
			title: 'Add-Project',
			path: '/admin/edit-project',
			editing: false,
			hasError: true,
			project: {
				title: title,
				description: description,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}
	const imageUrl = image.path;

	const project = new Project({
		title: title,
		imageUrl: imageUrl,
		description: description,
		category: category,
		area: area,
		userId: req.session.user,
	});
	project
		.save()
		.then(result => {
			console.log('Created Project');
			res.redirect('/admin/projects');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getEditProject = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const projId = req.params.projectId;
	Project.findById(projId)
		.then(project => {
			if (!project) {
				return res.redirect('/');
			}
			res.render('admin/edit-project', {
				title: 'Edit Project',
				path: '/admin/edit-project',
				editing: editMode,
				project: project,
				hasError: false,
				errorMessage: null,
				validationErrors: [],
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postEditProject = (req, res, next) => {
	const projId = req.body.projectId;
	const updatedTitle = req.body.title;
	const image = req.file;
	const updatedDescription = req.body.description;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-project', {
			title: 'Edit-Project',
			path: '/admin/edit-project',
			editing: true,
			hasError: true,
			project: {
				title: updatedTitle,
				description: updatedDescription,
				_id: projId,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}
	Project.findById(projId)
		.then(project => {
			project.title = updatedTitle;
			project.description = updatedDescription;
			if (image) {
				fileHelper.deleteFile(project.imageUrl);
				project.imageUrl = image.path;
			}
			return project.save();
		})
		.then(result => {
			console.log('Updated Project!');
			res.redirect('/admin/projects');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.deleteProject = (req, res, next) => {
	const projId = req.params.projectId;
	Project.findById(projId)
		.then(project => {
			if (!project) {
				return next(new Error('Project not found.'));
			}
			fileHelper.deleteFile(project.imageUrl);
			return Project.findByIdAndRemove(projId);
		})
		.then(() => {
			console.log('Project Deleted');
			res.status(200).json({ message: 'Success!' });
		})
		.catch(err => {
			res.status(500).json({ message: 'Deleting project failed.' });
		});
};

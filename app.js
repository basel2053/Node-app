const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); // pass your session
const csrf = require('csurf'); // csrf atk pattern
const flash = require('connect-flash');
const multer = require('multer');
const compression = require('compression');
const basicAuth = require('express-basic-auth');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

const store = new MongoDBStore({
	uri: process.env.MONGODB_URI,
	collection: 'sessions',
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '-' + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.set('view engine', 'ejs');
app.set('views', 'views'); // default template engine path

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');

app.use(
	basicAuth({
		challenge: true,
		users: { eniuser: process.env.BASIC_AUTH },
	})
);
app.use(compression());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: store,
		// ,cookie:{maxAge:60000} set time for cookie before expiring
	})
);

app.use(csrfProtection); // csurf and flash should be intialized after sessions
app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.isUser = req.session.isUserLoggedIn;
	if (req.session.user) {
		res.locals.userPhoto = req.session.user.profilePicture;
		res.locals.currentUser = req.session.user;
	}

	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			if (!user) {
				return next();
			}
			req.user = user; // we extract the user
			next();
		})
		.catch(err => {
			next(new Error(err));
		});
});

app.use('/admin', adminRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use('/blog', blogRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

mongoose
	.connect(process.env.MONGODB_URI)
	.then(result => {
		app.listen(process.env.PORT || 3000);
	})
	.catch(err => console.log(err));

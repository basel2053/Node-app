const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		required: true,
		type: String,
		unique: true,
	},
	password: {
		required: true,
		type: String,
	},
	resetToken: String,
	resetTokenExpiration: Date,
});
module.exports = mongoose.model('User', userSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

export type UserModel = mongoose.Document & {
	local: {
		email: String,
		password: String,
		firstName: String,
		lastName: String,
		isVerified: Boolean,
		verifyToken: String
	}
	validPassword: (password: string) => boolean,
};

const userSchema = new mongoose.Schema({
	local: {
		email: String,
		password: String,
		firstName: String,
		lastName: String,
		isVerified: Boolean,
		verifyToken: String
	},
});

userSchema.statics.generateHash = function (password: string) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

// checking if password is valid
userSchema.methods.validPassword = function (password: string) {
	return bcrypt.compareSync(password, (this as any).local.password);
};

const User = mongoose.model('User', userSchema);
export default User;

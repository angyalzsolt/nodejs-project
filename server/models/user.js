const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

mongoose.set('useCreateIndex', true);

let UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	gender:{
		type: String
	},
	telephone: {
		type: String
	},
	address: {
		type: String
	},
	image: {
		type: String
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});


UserSchema.statics.findByCredentials = function(email, password){
	let User = this;
	return User.findOne({email}).then((user)=>{
		if(!user){
			return Promise.reject();
		};
		return bcrypt.compare(password, user.password).then((res)=>{
			if(res){
				return user;
			} else {
				return Prmoise.reject();
			};
		});
	});
};


UserSchema.methods.generateAuthToken = function(){
	let user = this;
	if(user.tokens.length !== 0){
		return Promise.reject();
	}
	let access = 'auth';
	let token = jwt.sign({
		exp:  Math.floor(Date.now() / 1000) + 9999,
		_id: user._id.toHexString()
	}, process.env.JWT_SECRET).toString();

	user.tokens = user.tokens.concat([{access, token}]);

	return user.save().then(()=>{
		return token;
	});
};




UserSchema.statics.findByToken = function(token){
	let user = this;
	let decoded;
	try{
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch(e){
		return Promise.reject();
	};

	return User.findOne({
		'_id':decoded._id,
		'tokens.token':token,
		'tokens.access': 'auth'
	});
};

UserSchema.methods.removeToken = function(token){
	let user = this;
	return user.updateOne({
		$pull: {
			tokens: {token}
		}
	});
};

UserSchema.pre('save', function(next){
	let user = this;
	if(user.isModified('password')){
		bcrypt.genSalt(10, (err, salt)=>{
			bcrypt.hash(user.password, salt, (err, hash)=>{
				user.password = hash;
				next();
			})
		})
	} else{
		next();
	};
});



let User = mongoose.model('User', UserSchema);

module.exports = {User};
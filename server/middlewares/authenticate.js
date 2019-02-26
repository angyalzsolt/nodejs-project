const {User} = require('./../models/user');

const authenticate = (req, res, next)=>{
	let token = req.cookies.jwt;

	User.findByToken(token).then((user)=>{
		if(!user){
			return Promise.reject();
		};
		req.user = user;
		next();
	}).catch((e)=>{
		res.redirect('/login');
	});
};

const loginCheck = (req, res, next)=>{
	let token = req.cookies.jwt;

	User.findByToken(token).then((user)=>{
		if(user){
			res.redirect('/home');
			next();
		};
		next();
	}).catch((e)=>{
		next();
	})
}




module.exports = {authenticate, loginCheck};
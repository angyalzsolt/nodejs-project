const passport = require('passport');
const LocalStrategy = require('pasport-local').Startegy;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcrypt');

const {User} = require('./../models/user');

passport.user(new LocalStrategy({
	emailField: email,
	passwordField: password,
}, async (username, password, done)=>{
	try{
		const userDocument = await User.findOne({email: email}).exec();
		const passwordMatch = await bcrypt.compare(password, userDocument.password);

		if(passwordMatch){
			return done(null, userDocument);
		} else {
			return done('Incorrect Username / Password');
		}
	} catch(error){
		done(error);
	}
}));


passport.use(new JWSTStrategy({
	jwtFromRequest: req=> req.cookies.jwt,
	secretOrKey: secret,
}, (jwtPayload, done)=>{
	if(Date.now() > jwtPayload.expires){
		return done('jwt expired');
	};

	return done(null, jwtPayload);
}));
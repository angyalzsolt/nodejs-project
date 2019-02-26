require('./config/config');
const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const path = require('path');


const {db} = require('./db/mongoose');
const {User} = require('./models/user');
const {authenticate, loginCheck} = require('./middlewares/authenticate');

const publicPath = path.join(__dirname + '/../public');


const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(publicPath));
app.use(cookieParser());

// Sign up page
app.get('/register', loginCheck, (req, res)=> {
	res.sendFile(publicPath+'/register.html');
});

// Sign up request
app.post('/register', (req, res)=> {
	let body = _.pick(req.body, ['name', 'email', 'password']);
	let user = new User(body);

	user.save().then((doc)=> {
		res.send(doc)
	}).catch((e)=> {
		res.status(400).send(e);
	});
});

// Login page
app.get('/login', loginCheck, (req,res)=> {
	res.sendFile(publicPath+'/login.html');
});

//Login, add token to the user
app.post('/login', (req, res)=>{
	let body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user)=>{
		return user.generateAuthToken().then((token)=>{
			res.cookie('jwt', token).status(200).send({ user });
		})
	}).catch((e)=>{
		res.status(400).send(e);
	});
});


// Home page, test for only authorized visitors
app.get('/home', authenticate, (req, res)=> {
	res.sendFile(publicPath+'/home.html');
})


app.delete('/home', authenticate, (req, res)=>{
	req.user.removeToken(req.cookies.jwt).then(()=>{
     	res.clearCookie('jwt');
     	res.send('TOKEN REMOVED, BUT COOKIE STILL IN PLACE');
     }).catch((e)=>{
     	res.status(400).send(e);
     })});


app.get('/profile', authenticate, (req, res)=> {
	res.sendFile(publicPath+'/profile.html');
})

app.get('/profile/id', authenticate, (req, res)=>{
	let id = req.user._id;
	User.findOne(id).then((user)=>{
		res.send(user);
	}).catch((e)=>{
		res.status(404).send(e);
	})
})



app.patch('/profile', authenticate, (req,res)=>{
	let id = req.user._id;
	let body = _.pick(req.body, ['gender', 'telephone', 'address']);
	console.log(body);
	
	User.findOneAndUpdate({
		_id: id,
	}, {$set: body}, {new: true, useFindAndModify: false}).then((user)=>{
		if(!user){
			return res.status(404).send();
		};
		res.send({user});
	}).catch((e)=>{
		res.status(400).send();
	});

});

app.get('/test', authenticate, (req, res)=>{
	let id = req.user._id;

	User.findOne(id).then((user)=>{
		if(!user){
			return res.status(404).send();
		};
		console.log(user)
		res.send({user});
	}).catch((e)=>{
		res.status(400).send();
	})
});


app.get('/cookie',authenticate, (req, res)=>{
   
     req.user.removeToken(req.cookies.jwt).then(()=>{
     	res.clearCookie('jwt');
     	res.send('TOKEN REMOVED, BUT COOKIE STILL IN PLACE');
     }).catch((e)=>{
     	res.status(400).send(e);
     })});



app.listen(port, ()=> {
	console.log(`Started on port ${port}`);
})
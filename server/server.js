require('./config/config');
const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');


const {db} = require('./db/mongoose');
const {User} = require('./models/user');

const publicPath = path.join(__dirname + '/../public');


const port = process.env.PORT || 3000;
const app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(publicPath));
app.use(cookieParser());
// Sign up page
app.get('/register', (req, res)=> {
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
app.get('/login', (req,res)=> {
	res.sendFile(publicPath+'/login.html');
});

//Login, add token to the user
app.post('/login', (req, res)=>{
	let body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user)=>{
		return user.generateAuthToken().then((token)=>{
			// res.header('x-auth', token).send(user);
			res.cookie('jwt', token, { httpOnly: true, secure: true }).status(200).send({ user });;
		})
	}).catch((e)=>{
		res.status(400).send(e);
	});
});




// Home page, test for only authorized visitors
app.get('/home', (req, res)=> {
	res.sendFile(publicPath+'/home.html');
})






app.listen(port, ()=> {
	console.log(`Started on port ${port}`);
})
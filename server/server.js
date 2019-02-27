require('./config/config');
const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const path = require('path');


const multer = require('multer');

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

app.use(express.static('uploads'));
app.use(express.static('public'));

app.set('trust proxy', 1);

const storage = multer.diskStorage({
	destination: publicPath + '/../uploads/',
	filename: function(req, file, cb){
		cb(null, 'img' + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({
	storage: storage,
	limits:{ fileSize: 10000000},
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	}
}).single('img');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}


app.post('/image', authenticate, (req, res)=>{
	let id = req.user._id;
	console.log(id);
	upload(req, res, (err)=>{
		// console.log(req.file);
		// console.log(id);
		if(err){
			res.status(401).send(err);
		} else {
			if(req.file == undefined){
				res.status(404).send(err);
			} else {
				User.findOneAndUpdate({
					_id: id,
				}, {$set:{ 'image': req.file.filename}}, {new: true, useFindAndModify: false}).then((user)=>{
					res.send(user)
				}).catch((e)=>{
					res.status(401).send(e);
				})
			}
		}
	})
})

app.patch('/image', authenticate, (req, res)=>{

	// let img = req.body.title;
	// res.send(console.log(img));
	let img = req.body.title;

	fs.stat(publicPath + './../uploads/'+img, function (err, stats) {
   console.log(stats);//here we got all information of file in stats variable

	   if (err) {
	       return console.error(err);
	   }

	   fs.unlink(publicPath + './../uploads/'+img,function(err){
	        if(err) return console.log(err);
	        console.log('file deleted successfully');
	   });  
});


	let id = req.user._id;
	User.findOneAndUpdate({
		_id: id,
	}, {$set: {'image': ''}}, {new: true, useFindAndModify: false}).then((user)=>{
		if(!user){
			return res.status(404).send();
		};
		res.send({user});
	}).catch((e)=>{
		res.status(400).send();
	});
})


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
	// console.log(body);
	
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


app.listen(port, ()=> {
	console.log(`Started on port ${port}`);
});
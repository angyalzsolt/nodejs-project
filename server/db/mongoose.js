const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;

db.on('connected',()=>{
	console.log('Connected to the database');
});
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = {db};

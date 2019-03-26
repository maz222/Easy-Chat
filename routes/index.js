var express = require('express');
var router = express.Router();
const path = require('path');

const dbUser = "master";
const dbPass = "master1";

const dbURL = `mongodb://${dbUser}:${dbPass}@ds121406.mlab.com:21406/chat-app`;

var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect(dbURL, {useNewUrlParser: true});
mongoose.connection.on('error', function(err) {
	console.log("MongoDB error: %s", err);
});
mongoose.connection.on('open', () => {
	console.log("connected to db!");
	console.log(mongoose.connection.readyState);
})
const roomJSON = {name:String, users:[String], messages:[{user:String, message:String}]};
const roomSchema = mongoose.Schema(roomJSON);
const roomModel = mongoose.model('Room', roomSchema, "Rooms");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.sendFile(path.join("../" + __dirname + '/frontend/build/index.html');
});

//get a list of room names
router.get('/API/rooms', function(req, res, next) {
	roomModel.find({}).select('name').exec((err, names) => {
		res.send(names);
	});
}); 

//get a list of messages from a given room
router.get('/API/roomMessages', function(req, res, next) {
	if(req.query.roomName == undefined || req.query.roomName.length == 0) {
		res.send({messages:[]});
	}
	roomModel.find({name:req.query.roomName}).select('messages').exec((err, messages) => {
		res.send(messages);
	});
})

//get a list of users from a given room
router.get('/API/roomUsers', function(req, res, next) {
	if(req.query.roomName == undefined || req.query.roomName.length == 0) {
		res.send({users:[]});
	}
	roomModel.find({name:req.query.roomName}).select('users').exec((err, users) => {
		res.send(users);
	});
})

router.post('/API/createRoom', function(req, res, next) {
	console.log(req.query.roomName);
	if(req.query.roomName === undefined || req.query.roomName.length === 0) {
		res.sendStatus(400);
		return;
	}
	roomModel.findOne({name:req.query.roomName}).exec((err, room) => {
		//room already exists; exit
		if(room) {
			console.log(room);
			res.sendStatus(400);
			return;
		}
		var room = roomModel.create({name:req.query.roomName, users:[], messages:[]}, (err, roomInstance) => {
			if(err) {
				console.log(err);
				res.sendStatus(400);
			}
			console.log("Added room! " + req.query.roomName);
		});
		res.sendStatus(201);
	});
})

router.post('/API/sendMessage', function(req, res, next) {
	if(req.query.roomName === undefined || req.query.roomName.length === 0) {
		res.sendStatus(400);
		return;
	}
	if(req.query.message === undefined || req.query.message.length === 0) {
		res.sendStatus(400);
		return;
	}
	if(req.query.user === undefined || req.query.user.length === 0) {
		req.query.user = "Guest";
	}
	const message = {user:req.query.user, message:req.query.message};
	roomModel.updateOne({name:req.query.roomName},{$push: {messages: message}}).exec((err, room) => {
		if(room) {
			console.log(room);
			console.log("added message");
			res.sendStatus(201);
		}
	});
});

module.exports = router;

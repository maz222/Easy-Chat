var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if(process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'client/build')));
	app.get('*', function(req, res) {
		res.sendFile(path.join(__dirname + '/client/build/index.html'));
	});
}

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var http = require('http');
var server = http.createServer(app);
server.listen(process.env.PORT || 4000);

var io = require('socket.io').listen(server);
io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('disconnect', () => {console.log('a user disconnected');});
	socket.on('room created', (room) => {
		console.log('room created');
		console.log(room);
		io.emit('room created', room);
		socket.join(room.roomName);
	});
	socket.on('message sent', (message) => {
		console.log('message sent');
		console.log(message);
		io.to(message.roomName).emit('message sent', message);
	});
	socket.on('joined room', (room) => {
		console.log('joined room');
		console.log(room);
		socket.join(room.roomName);
	});
	socket.on('left room', (room) => {
		console.log('left room');
		console.log(room);
		socket.leave(room.roomName);
	})
});




module.exports = app;

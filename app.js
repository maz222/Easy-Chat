var express = require('express');
var path = require('path');
var app = express();

if(process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'client/build')));
	app.get('*', function(req, res) {
		res.sendFile(path.join(__dirname + '/client/build/index.html'));
	});
}

app.listen(process.env.PORT || 4000);

module.exports = app;
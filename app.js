const express = require('express');
const errorhandler = require('errorhandler');
const app = express();
const port = 8080;
const server = app.listen(port, function() {
    console.log('Node.js is listening to PORT:' + server.address().port);
});
const io = require('socket.io').listen(server);
var userHash = {};

app.set('view engine', 'ejs');
app.get('/', function(req, res) {
    res.redirect(302, '/chat');
});
app.get('/chat', function(req, res) {
    res.render('chat', {});
});
app.use(function(req, res, next) {
    var error = new Error('Cannot ' + req.method + ' ' + req.path);
    error.status = 404;
    next(error);
});
app.use(errorhandler());
io.sockets.on('connection', function(socket) {
	socket.on('connected', function(name) {
		var msg = name + 'が入室しました';
		msg = htmlspecialchars(msg);
		userHash[socket.id] = name;
		io.sockets.emit('publish', {value: msg});
	});
	socket.on('publish', function(data) {
		var msg = htmlspecialchars(data.value);
		io.sockets.emit('publish', {value: msg});
	});
	socket.on('changeName', function(name) {
		var msg = userHash[socket.id] + 'が名前を' + name + 'に変更しました';
		msg = htmlspecialchars(msg);
		userHash[socket.id] = name;
		io.sockets.emit('publish', {value: msg});
	});
	socket.on('disconnect', function() {
		if (userHash[socket.id]) {
			var msg = userHash[socket.id] + 'が退出しました';
			msg = htmlspecialchars(msg);
			delete userHash[socket.id];
			io.sockets.emit('publish', {value: msg});
		}
	});
});

function htmlspecialchars(str) {
	return str.replace(/[&'`"<>']/g, function(match) {
		return {
			'&': '&amp;',
			"'": '&#x27;',
    		'`': '&#x60;',
			'"': '&quot;',
			'<': '&lt;',
			'>': '&gt;',
		}[match]
	});
}
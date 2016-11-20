// modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json 
app.use(bodyParser.json());

var options = {
  root: __dirname,
};

// A view for all answers
app.get('/', function(req, res){
  res.sendFile('index.html', options);
});

// A test view to send answers
app.get('/message', function(req, res){
	res.sendFile('message.html', options);
});

// A router to send answers by json post
app.post('/message', function(req, res){
	console.log(req.body);
  io.emit('chat message', req.body.message);
});

// socket.io to connect this server with answer view
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
	console.log('listening to port:' + port);
});

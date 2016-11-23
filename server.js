// modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var https = require('https').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var LINEBot = require('line-messaging');

// port number
var port = process.env.PORT || 3000;

// LINE bot instance
var bot = LINEBot.create({
  channelID: '1489062968',
  channelSecret: '71e1c7bf525ace35ac89c39c45d11d7f',
  channelToken: 'oAMtDVspf6zqGXP+4kP9max88/w/wsnOyoecOXRNPb2YxWYt+ko0gN3JbcqdX+OhDzajL/l7Qie8+eU3zcqO31cxNePOhjiUHDCT3EIgP6I/9ef4LnONPzVe6mOyHF5gWZ89CagcF9PFfir1L4RMIgdB04t89/1O/w1cDnyilFU='
}, https);

// parse bot message
app.use(bot.webhook('/message'));

// Message event
bot.on(LINEBot.Events.MESSAGE, function(replyToken, message) {
  // add code below. 
  io.emit('chat message', "message");
});

var options = {
  root: __dirname,
};

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json 
app.use(bodyParser.json());

// A view for all answers
app.get('/', function(req, res){
  res.sendFile('index.html', options);
});

// A test view to send answers
// app.get('/message', function(req, res){
// 	res.sendFile('message.html', options);
// });

// A router to send answers by json post
// app.post('/message', function(req, res){
// 	console.log(req.body);
//   io.emit('chat message', req.body.message);
// });

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

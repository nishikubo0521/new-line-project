// modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var async = require('async');
var crypto = require('crypto');
var request = require('request');

// port number
var port = process.env.PORT || 3000;

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

// A router to send answers by json post
app.post('/message', function(req, res){

		// リクエストがLINE Platformから送られてきたか確認する
		if (!validate_signature(req.headers['x-line-signature'], req.body)) {
			io.emit('chat message', 'LINEじゃないよ！');
			return;
		}

		// テキストが送られてきた場合のみ返事をする
		if ((req.body['events'][0]['type'] != 'message') || (req.body['events'][0]['message']['type'] != 'text')) {
			io.emit('chat message', 'テキストはないよ！');
			return;
		}

		// テキスト送信元のユーザーIDを取得する。
		var userId = req.body['events'][0]['source']['userId'];

		var options = {
		  url: 'https://api.line.me/v2/bot/profile/' + userId,
		  proxy: process.env.FIXIE_URL,
      json: true,
		  headers: {
		    'Authorization': 'Bearer {' + process.env.LINE_CHANNEL_ACCESS_TOKEN + '}'
		  }
		};

		// ユーザー情報を取得する。
		request.get(options, function(error, response, body){
			if (!error && response.statusCode == 200) {
				io.emit('chat message', body['displayName'] + ': ' + req.body['events'][0]['message']['text']);
				res.status(200).end();
			}
		});

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

// 署名検証
function validate_signature(signature, body) {
    return signature == crypto.createHmac('sha256', process.env.LINE_CHANNEL_SECRET).update(new Buffer(JSON.stringify(body), 'utf8')).digest('base64');
}

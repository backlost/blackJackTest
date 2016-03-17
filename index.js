var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



var JOKER_ARR = ["H01","H02","H03","H04","H05","H06","H07","H08","H09","H10","H11","H12","H13",
"B01","B02","B03","B04","B05","B06","B07","B08","B09","B10","B11","B12","B13",
"F01","F02","F03","F04","F05","F06","F07","F08","F09","F10","F11","F12","F13",
"M01","M02","M03","M04","M05","M06","M07","M08","M09","M10","M11","M12","M13"];

app.get('/', function(req, res){
  res.sendfile('index.html');
});


var waitUsers =[];
var playingUsers =[];
var resultList = {};
var stateBox ;

io.on('connection', function(socket){

	console.log('a user connected：'+socket.id);

	socket.on('login', function(username){
		var obj={};
		obj.username = username;
		obj.id=socket.id;

		//socket放入等待列表
		waitUsers.push(socket);
		socket.emit('ready', {user:obj});

		console.log(obj.username+'['+socket.id+']'+'加入了游戏');

		//让大家玩起来
		if(waitUsers.length>1){
			while(waitUsers.length>0){
				var _tmpUs =waitUsers.pop();
				playingUsers.push(_tmpUs);
				io.emit('start', {});
			}
		}
	});



	
	socket.on('getcard', function(){

		var _JokerLength = JOKER_ARR.length;
		//这里应该给error
		if(_JokerLength==0){
			return;
		}
		var _index = Math.floor(Math.random()*_JokerLength);
		var _Joker = JOKER_ARR.index(_index);
		JOKER_ARR.splice(_index, 1);

		if(!!resultList[socket.id]){
			resultList[socket.id].push(_Joker);
		}else{
			resultList[socket.id]=[_Joker];
		}

		socket.emit("newcard",_Joker);
	});

	socket.on('getscore', function(){
		var _JokerList = resultList[socket.id];
		var _sum =0;
		for(var _in in _JokerList){
			var number = parseInt(_JokerList[_in].substr(1));
			if(number>10){
				number = 10;
			}
			_sum +=number;
		}
		socket.emit("sumscore",_sum);
		
	});

	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		// if(onlineUsers.hasOwnProperty(socket.name)) {
		// 	//退出用户的信息
		// 	var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
		// 	//删除
		// 	delete onlineUsers[socket.name];
		// 	//在线人数-1
		// 	onlineCount--;
			
		// 	//向所有客户端广播用户退出
		// 	io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		// 	console.log(obj.username+'退出了聊天室');
		// }
		io.emit("over");
		waitUsers=[];
		playingUsers=[];
		resultList={};
		console.log("disconnect");
	});
})

http.listen(3000, function(){
    console.log('listening on *:3000');
});

var util = require('util');

var app = require('express')(), _server = require('http').createServer(app), io = require(
		'socket.io').listen(_server);

var Player = require('../../../modules/shared/Player');
var Room = require('../../../modules/room/shared/Room');
var RoomList = require('../../../modules/room/shared/RoomList');

var counter = 1;
var Server = function(opts) {
	var server = this
	this.server = _server;
	this.roomList = {
			'free' : [],
			'speed' : []
	};
	var demoRoom = new Room({
				id: 0,
				region : 'demo-one',
				gameplay : 'free' ,
				players : {}
	});
	
	this.roomList.free [ 0 ] = demoRoom;
	this.roomList.free [ 0 ] .channel = io.sockets.in(demoRoom.getChannelName());
	this.playerList = [];
	
	
	/*
	 * var opts = { VERSION : '0.0.0', KEY : 'CSCI3100-GROUP6', port : 7777 };
	 */
	_server.listen(opts.port, function() {
		console.log("Express server listening on port" + opts.port);
	});

	io.sockets.on('connection', function(socket) {
		this.room = null;
		this.player = null;
		
		socket.on('disconnect',function(data){
			if(!socket.player) return;
			console.log("disconnected : " + '[' + socket.player.id+'] ' + socket.player.username);
			var room = socket.player.room;
			if(room != null){
				room.removePlayer( socket.player );			
				room.channel.emit('SM_Room_Status',room);
				socket.leave( room.getChannelName());
			}
			socket.player.room = null;
			
			if(room.noOfPlayer() < 2 && room.status == Room.STATUS_PLAYING){
				room.status = Room.STATUS_WAITING;
			}
			server.playerList[ socket.player.id ] = null;
			delete socket.player;
			
	
		});
		
		socket.emit('SM_helloworld', {
			data : "ping"
		});
		socket.on('CM_helloworld', function(data) {
			console.log(" >>> [CM_helloworld]");
			console.log(data);
		});

		socket.on('CM_Game_State',function(data){
			console.log(socket.player);
			socket.broadcast.to( socket.player.room.getChannelName() ).emit('SM_Game_State',{id:socket.player.id,position:data.position,rotation:data.rotation});
		});
		
		socket.on('CM_Room_GameStart',function(){
			socket.player.ready = true;
			
		
			if(socket.player.room.isAllReady()){
				socket.player.room.status = Room.STATUS_PLAYING;
				io.sockets.in(socket.player.room.getChannelName()).emit('SM_Game_State',{type:'start',room:socket.player.room});
			}
			// aconsole.log(io.sockets.in(socket.player.room.getChannelName()));
			io.sockets.in(socket.player.room.getChannelName()).emit('SM_Room_Status',socket.player.room);
		});
		socket.on('CM_RoomList_Request',function(data){
			console.log(data);
			// socket.emit('SM_RoomList_Response',{});
			
			var result = server.roomList.free [ 0 ].addPlayer( socket.player );
			if(result == true){
				socket.join( server.roomList.free [ 0 ].getChannelName());
				io.sockets.in(socket.player.room.getChannelName()).emit('SM_Room_Status',server.roomList.free [ 0 ]);
			}else{
				socket.emit('SM_Room_Status',{error:"The World you are attempting to join is full or playing."});
			}
			// socket.emit('SM_Room_Status',server.roomList.free [ 0 ]);
			
			// socket.emit('SM_Room_GameStart',{time:new Date()});
		});
		
		
		
		socket.on('CM_Login',
				function(data) {
					console.log(" >>> [CM_Login]");
					console.log(data);
					if (data.user_id == undefined
							|| data.user_token == undefined) {
						socket.emit('SM_Login_Response', {
							message : "message_error"
						});
						socket.disconnect();
					}
					if (data.user_id == '0'
							&& data.user_token == 'DEMO_SESSION') {
						
						 data.info.id = data.user_id = counter++;
						if(server.playerList.indexOf [ data.user_id ] != undefined){
							server.playerList [ data.user_id ].socket.disconnect();
							delete server.playerList [ data.user_id ];
						}
						
						server.playerList [ data.user_id ] = new Player({username:data.info.username,user_id: data.info.id,socket:socket});
						socket.player = server.playerList [ data.user_id ];
						
						socket.emit('SM_Login_Response', {
							message : "success",
							user : socket.player
						});
					} else {
						socket.emit('SM_Login_Response', {
							message : "forbidden"
						});
						socket.disconnect();
					}

				});
	});
	this.listeners = [];
};
Server.prototype.onconnection = function(socket) {

};
Server.prototype.ondisconnection = function(socket) {

};
Server.prototype.register = function(ServerMessageClass) {
	// register the Server Message Class to the socket
};
Server.prototype.emit = function(MessageObject) {
	// emit an event described in the Client Message Object
};

module.exports = Server;
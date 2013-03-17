var THREE = require('../../../vendor/Three');
var util = require('../../Util');
var GameObjectManager = require('../../GameObjectManager');
var World = require('../../World');
var io = require('../../../vendor/socket.io-client');

var ClientMessage = require('./ClientMessage');
var ServerMessage = require('./ServerMessage');

var AbstractConnection = function(opts) {
	var conn = this;

	this.opts = util.extend({
		address : "ws://localhost:7777"
	}, opts);
	this.socket = null;
	this.io = io;
	this.connected = false;
	this.listeners = [];
	AbstractConnection.instance = this;
	AbstractConnection.INTSTANCE = this;
	this.ON_CONNECT = 'connect';
	this.ON_DISCONNECT = 'disconnect';
	this.ON_ERROR = 'error';
}

AbstractConnection.prototype.connect = function() {
	var conn = this;
	var socket = this.socket = io.connect(this.opts.address);
	this.connected = true;
	socket.profile = {

	};
	/*
	 * socket.on("error",function(data){ console.log("network error");
	 * console.log(data); });
	 */
	this.listeners.forEach(function(listener) {
		console.log(listener.NAME + ' listened');
		if (listener.NAME) {
			socket.on(listener.NAME, function(data) {
				console.log(" >>> [" + listener.NAME + "] ");
				console.log(data);
				var sm = new listener(data);
			});

		}else{
			listener(this.socket);
		}
	});

};
AbstractConnection.prototype.register = function(className) {
	console.log(className);
	this.listeners.push(className);
};
AbstractConnection.prototype.on = function(e, callback) {
	callback.NAME = e;
	this.register(callback);
};
AbstractConnection.prototype.emit = function(object) {
	console.log(" <<< [" + object.NAME + ']');
	// console.log(object.data);

	this.socket.emit(object.NAME, object.data);
}



module.exports = AbstractConnection;
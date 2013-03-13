//abstract game class
var jQuery = require('../vendor/jQuery');
var THREE = require('../vendor/Three');
var THREEx = THREEx || {};
THREEx.FullScreen = require('../vendor/THREEx/FullScreen');
THREE.TrackballControls = require('../vendor/THREE/TrackballControls');
THREEx.WindowResize = require('../vendor/THREEx/WindowResize');
var Physijs = require('../vendor/Physi');
var SceneManager = require('./SceneManager');
var AssetManager = require('./AssetManager');
var GameObjectManager = require('./GameObjectManager');
var util = require('util');

/**
 * Three.js World 
 * @
 * @see http://mrdoob.github.com/three.js/docs/56/
 */
var World = function(opts) {

	if (World.instance === null) {
		World.instance = this;
	} else {
		throw Error('Singeton Pattern Error');
	}

	var game = this;
	this.opts = World.extend({
		"width" : window.innerWidth,
		"height" : window.innerHeight,
		"container" : document.body,
		"allowFullScreen" : false,
		"fullScreenOpts" : {},
		"rendererOpts" : {
			antialias : true
		},
		"physics" : false,
		"physics.gravity" : new THREE.Vector3(0, -30, 0)
	}, opts);
	World.opts = this.opts;
	//this.scenes = new SceneManager();
	this.assets = new AssetManager();
	this.gameobjects = new GameObjectManager(); //global gameobject

	// renderer
	this.renderer = new THREE.WebGLRenderer(this.opts.rendererOpts);
	this.renderer.setSize(this.opts.width, this.opts.height);
	this.renderer.autoClear = false;
	this.renderer.shadowMapEnabled = true;
	this.renderer.shadowMapSoft = true;

	this.opts.container.appendChild(this.renderer.domElement);
	this.opts.domElement = this.renderer.domElement;

	// full-screen options
	if (opts.allowFullScreen) {
		console.log("fullscreen : on");
		THREEx.FullScreen.bindKey(World.extend({
			element : this.renderer.domElement
		}, this.opts.fullScreenOpts));
	}

	// resize options (Full-screen size)
	if (opts.width == this.opts.width && opts.height == this.opts.height
			|| (!opts.width && !opts.height)) {
		this.opts.resize = true;
		console.log("resize handler : on");
		window.addEventListener('resize', function() {
			game.onWindowResize();
		}, false);
	}

	if (opts.physics) {
		Physijs.scripts.worker = '/js/physijs_worker.js';
		Physijs.scripts.ammo = '/js/ammo.js';
	}
	this.initialized = false;
	this.active = false;

	this.modules = [];
	this.regions = [];
	this.activeRegion;
	this.gameplay;
	this.time = Date.now();
	this.active = false;
};

World.instance = null;
World.opts = {};

World.ready = function(func) {
	window.addEventListener("load", function load(event) {
		window.removeEventListener("load", load, false);
		func();
	}, false);
};
World.extend = jQuery.extend;

// boilerplate
World.prototype.boilerplate = function() {

	this.scenes.boilerplate();
	this.gameobjects.boilerplate();
	this.scenes.active.scene.add(this.gameobjects.get("__boilerplate_cube"));
	// this.gameobjects.get("__boilerplate_cube").position.y +=10;

	var activeScene = this.scenes.active.scene;

	this.controls = new THREE.TrackballControls(this.scenes.active.cameras.main);
	this.controls.rotateSpeed = 4.0;
	this.controls.zoomSpeed = 3.6;
	this.controls.panSpeed = 2.0;
	this.controls.noZoom = false;
	this.controls.noPan = false;
	this.controls.staticMoving = true;
	this.controls.dynamicDampingFactor = 0.3;
	this.controls.keys = [ 65, 83, 68 ];
	this.gameobjects.add("__boilerplate_controls_trackball", this.controls);
	// controls.addEventListener('change', this.render);
	return this;
};

/**
 * Initialization code goes here
 */
World.prototype.initialize = function() {
	this.initialized = true;

	return this;
};

World.prototype.start = function() {
	if (this.initialized == false) {
		throw Error("World NOT INITIALIEZD");
	}
	this.active = true;
	var game = this;
	function animate() {
		if (game.active) {
			requestAnimationFrame(animate);
			game.render();
		}
	}
	animate();
};
World.prototype.pause = function() {
	if (this.initialized == false) {
		throw Error("World NOT INITIALIEZD");
	}
	this.active = false;
	return this;
};

World.prototype.stop = function() {
	this.pause();
	this.initialized = false;
	// TODO free resource
	return this;
};

World.prototype.render = function() {
	this.activeRegion.render(Date.now() - this.time);
	if (this.gameplay != undefined)
		this.gameplay.render(Date.now() - this.time);

	this.time = Date.now();
	this.renderer.clear();
	this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	this.renderer.render(this.activeRegion.scene, this.activeRegion.camera);
	/*  this.gameobjects.render(1 / 60);
	  this.scenes.render(1 / 60);

	  this.renderer.clear();
	  this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	  this.renderer.render(this.scenes.active.scene,this.scenes.active.cameras.main);
	 */
	// override this method to add other camera
};

World.prototype.onWindowResize = function() {
	/*
	 this.scenes.active.cameras.main.aspect = window.innerWidth
	 / window.innerHeight;
	 this.scenes.active.cameras.main.updateProjectionMatrix();*/
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	// this.controls.handleResize();
	this.render();
}

module.exports = World;
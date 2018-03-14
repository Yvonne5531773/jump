(function(window) {
	'use strict';
	/**
	 * Maze class
	 * @param wrapper
	 * @param button
	 */
	function ThreeDance(wrapper, button) {
		// Object attributes
		this.wrapper = wrapper;
		this.camera = {};
		this.cameraHelper = {};
		this.scene = {};
		this.materials = {};
		this.map = [];
		this.renderer = {};
		this.player = {};
		this.end = {};
		this.side = 31;
		this.thickness = 20;
		this.cube = [];
		this.plane = {};
		this.fo = {};
		this.nx = 40;
		this.ny = 40
		this.size = 20
		this.start_point_x = 200
		this.start_point_y = 190
		this.len = 1
		this.head_pos_x = 6  //开始X
		this.head_pos_y = 32 //开始Y
		this.head_for = 2;    //方向
		this.dir_x = [0, -1, 1, 0]
		this.dir_y = [1, 0, 0, -1]
		this.status = -1;
		this.pause_flag = false;
		this.board = []
		this.the_last_head = this.head_for;
		this.snake = []
		this.aRequest = {}
		this.gameover = false
		this.keynum = ''

		// Inits
		this.initScene();
		this.onWindowResize();
		this.render();

		// Events
		button.addEventListener('click', this.onGenerateMaze.bind(this));
		button.dispatchEvent(new Event('click'));
		window.addEventListener('resize', this.onWindowResize.bind(this));
		document.addEventListener('keydown', this.onKeyDown.bind(this));
	}

	ThreeDance.prototype.onGenerateMaze = function () {
		var new_player_path = [];
		var latency = 50;

		var end_hide_tween = new TWEEN.Tween({scale: 1, y: this.thickness / 2, mesh: this.end}).to({scale: 0, y: 0}, 300);
		var end_show_tween = new TWEEN.Tween({scale: 0, y: 0, mesh: this.end}).to({
			scale: 1,
			y: this.thickness / 2
		}, 300).delay((this.side * 2) * latency);
		end_hide_tween.onUpdate(this.onUpdateTweeningMesh);
		end_show_tween.onUpdate(this.onUpdateTweeningMesh);
		end_show_tween.onStart(function () {
			this.mesh.visible = true;
		});
		end_hide_tween.onComplete(function () {
			this.mesh.visible = false;
		});
		if (this.end.scale !== 0) {
			end_hide_tween.start();
		}
		end_show_tween.start();

		this.map = new_map;
		this.player.path = new_player_path;

		// Inits player
		this.player.mazePosition = {x: this.side - 1, z: this.side - 1};
		this.movePlayer(false);
	};

	ThreeDance.prototype.onUpdateTweeningMesh = function () {
		this.mesh.scale.y = this.scale;
		this.mesh.position.y = this.y;
	};

	ThreeDance.prototype.CreateCube = function(_s1, _s2, _s3)  {
		var geometry = new THREE.Mesh(new THREE.CubeGeometry(this.thickness, this.thickness, this.thickness, 1, 1, 1), this.materials.red);
		geometry.position.set(-((1 / 2) * this.thickness) + (this.thickness * 2), 0, -((1 / 2) * this.thickness) + (this.thickness * 2));
		geometry.scale.y = 0;
		geometry.visible = true
		return geometry
	}

	ThreeDance.prototype.initScene = function () {
		// Scene
		this.scene = new THREE.Scene();

		// Materials
		this.materials =
			{
				grey: new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: false}),
				red: new THREE.MeshLambertMaterial({color: 0xf18260, ambient: 0xf18260, lineWidth: 1}),
				blue: new THREE.MeshLambertMaterial({color: 0xf18260, ambient: 0xf18260, lineWidth: 1}),
			};

		// Camera
		this.camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
		this.camera.clicked = false;

		// Lights
		this.scene.add(new THREE.AmbientLight(0xc9c9c9));
		var directional = new THREE.DirectionalLight(0xc9c9c9, 0.5);
		directional.position.set(0, 0.5, 1);
		this.scene.add(directional);

			// Camera helper
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.sqrt(3) * (this.side * this.thickness)), 0, 0);
		this.cameraHelper = new THREE.Line(geometry);
		this.scene.add(this.cameraHelper);
		this.cameraHelper.visible = false;
		this.cameraHelper.targetRotation = false;
		this.cameraHelper.rotation.set(0, 1.362275, 0.694716);

		for (let i = 0; i < this.nx; i++) {
			this.board[i] = []
			for (let k = 0; k < this.ny; k++) {
				this.board[i][k] = 0;
			}
		}
		this.fo = this.CreateCube(10, 10, 50);
		this.fo.castShadow = true;
		this.scene.add(fo);
		for (let i = 0; i < len; i++) {
			this.snake[i] = {}
			this.snake[i].x = this.head_pos_x + i * this.dir_x[3 - this.head_for];
			this.snake[i].y = this.head_pos_y + i * this.dir_y[3 - this.head_for];
			this.cube[i] = this.CreateCube(10, 10, 10);
			this.cube[i].position.x = this.snake[i].x * 10 - this.start_point_x;
			this.cube[i].position.y = -this.snake[i].y * 10 + this.start_point_y;
			this.cube[i].castShadow = true;
			this.scene.add(this.cube[i]);
			this.board[this.snake[i].x][this.snake[i].y] = 1;
		}

		// Renderer
		this.renderer = typeof WebGLRenderingContext != 'undefined' && window.WebGLRenderingContext ? new THREE.WebGLRenderer({antialias: true}) : new THREE.CanvasRenderer({});
		this.wrapper.appendChild(this.renderer.domElement);
	};


	var fps = 25;
	var now;
	var then = Date.now();
	var interval = 1000 / fps;
	var delta;
	ThreeDance.prototype.run = function() {
		this.aRequest = window.requestAnimationFrame(run)
		now = Date.now();
		delta = now - then;
		if (delta > interval) {
			then = now - (delta % interval);
			if (!this.pause_flag)
				this.move();
			this.render();
			if(this.gameover)
				window.cancelAnimationFrame(this.aRequest)
		}
	}

	ThreeDance.prototype.render = function () {
		requestAnimationFrame(this.render.bind(this));
		TWEEN.update();
		if (this.cameraHelper.targetRotation !== false) {
			this.cameraHelper.rotation.z += (this.cameraHelper.targetRotation.z - this.cameraHelper.rotation.z) / 10;
			this.cameraHelper.rotation.y += (this.cameraHelper.targetRotation.y - this.cameraHelper.rotation.y) / 10;
		}
		this.camera.position = this.cameraHelper.geometry.vertices[1].clone().applyProjection(this.cameraHelper.matrixWorld);
		this.camera.lookAt(this.scene.position);
		for (var i = 0; i < this.len; ++i) {
			this.cube[i].position.x = this.snake[i].x * 10 - this.start_point_x;
			this.cube[i].position.y = -this.snake[i].y * 10 + this.start_point_y;
		}
		this.camera.position.y = -this.snake[0].y * 3 - 300; //随着线的运动，镜头跟着走
		this.camera.position.x = this.snake[0].x * 3 - 100;
		this.renderer.render(this.scene, this.camera);
	};

	ThreeDance.prototype.move = function() {
		var tx = this.snake[0].x + this.dir_x[head_for];
		var ty = this.snake[0].y + this.dir_y[head_for];
		if (tx >= 0 && tx < nx && ty >= 0 && ty < ny) {
			if (this.board[tx][ty] !== 1) {
				this.the_last_head = this.head_for;
				this.snake[this.len] = {}
				this.snake[this.len].x = this.snake[this.len - 1].x;
				this.snake[this.len].y = this.snake[this.len - 1].y;
				this.cube[this.len] = this.CreateCube(10, 10, 10);
				this.cube[this.len].position.x = this.snake[this.len].x * 10 - this.start_point_x;
				this.cube[this.len].position.y = -this.snake[this.len].y * 10 + this.start_point_y;
				this.cube[this.len].castShadow = true;
				this.scene.add(this.cube[this.len]);
				this.board[tx][ty] = 1;
				this.len++;
				if (this.board[tx][ty] === 2) {
					this.snake[this.len] = {}
					this.snake[this.len].x = this.snake[this.len - 1].x;
					this.snake[this.len].y = this.snake[this.len - 1].y;
					this.cube[this.len] = this.CreateCube(10, 10, 10);
					this.cube[this.len].position.x = this.snake[this.len].x * 10 - this.start_point_x;
					this.cube[this.len].position.y = -this.snake[this.len].y * 10 + this.start_point_y;
					this.cube[this.len].castShadow = true;
					this.scene.add(this.cube[this.len]);
					this.board[tx][ty] = 1;
					this.len++;
					this.food();
				}
				for (let i = this.len - 1; i > 0; i--) {
					this.snake[i].x = this.snake[i - 1].x;
					this.snake[i].y = this.snake[i - 1].y;
				}
				this.snake[0].x = tx;
				this.snake[0].y = ty;
			}
			else {
				if (this.the_last_head + this.head_for !== 3) {
					this.over()
				}
				else {
					this.head_for = this.the_last_head;
				}
			}
		} else {
			this.over()
		}
		for (let i = 0; i < nx; i++) {
			for (let k = 0; k < ny; k++) {
				if (this.board[i][k] == 1)
					this.board[i][k] = 0;
			}
		}
		for (let i = 0; i < this.len; i++) {
			this.board[this.snake[i].x][this.snake[i].y] = 1;
		}
	}

	ThreeDance.prototype.food = function() {
		let tx, ty;
		do {
			tx = Math.ceil(Math.random() * 1000) % this.nx;
			ty = Math.ceil(Math.random() * 1000) % this.ny;
		} while (this.board[tx][ty]);
		this.board[tx][ty] = 2;
		this.fo.position.x = tx * 10 - this.start_point_x;
		this.fo.position.y = -ty * 10 + this.start_point_y;
		this.fo.position.z = 20;
	}

	ThreeDance.prototype.over = function() {
		console.log("game over!\ryour score is " + this.len);
		this.gameover = true
	}

	ThreeDance.prototype.onKeyDown = function (event) {
		if (this.status == -1) {
			this.status = 0;
			this.food();
			this.run();
		}
		if (window.event){
			this.keynum = event.keyCode;
		}
		else if (event.which) {
			this.keynum = event.which;
		}
		if (this.keynum == 38 && this.head_for != 0)
			this.head_for = 3;
		if (this.keynum == 40 && this.head_for != 3)
			this.head_for = 0;
		if (this.keynum == 37 && this.head_for != 2)
			this.head_for = 1;
		if (this.keynum == 39 && this.head_for != 1)
			this.head_for = 2;
		if (this.keynum == 80)
			this.pause_flag = !this.pause_flag;
		if (this.keynum != 80)
			this.pause_flag = false;
	}

	ThreeDance.prototype.onWindowResize = function () {
		var width = window.innerWidth || window.document.body.clientWidth;
		var height = window.innerHeight || window.document.body.clientHeight;
		this.renderer.setSize(width, height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	};

	ThreeDance.prototype.removePlayerPath = function (x, y, delay) {
		var tween = new TWEEN.Tween({scale: 1, y: this.thickness / 8, mesh: this.player.path[x][y]}).to({
			scale: 0,
			y: this.thickness * 5
		}, 300).delay(delay);
		var self = this;
		this.player.path[x][y] = false;
		tween.onUpdate(function () {
			this.mesh.scale.set(this.scale, this.scale, this.scale);
			this.mesh.position.y = this.y;
		});
		tween.onComplete(function () {
			self.scene.remove(this.mesh);
		});
		tween.onStart(function () {
			this.mesh.visible = true;
		});
		tween.start();
	};

	// ThreeDance.prototype.onKeyDown = function (evt) {
	// 	// Gets the direction depending on the pressed key
	// 	var code = evt.keyCode;
	// 	var direction = {x: 0, z: 0};
	// 	var directions = {
	// 			37: {x: 1, z: 0},
	// 			39: {x: -1, z: 0},
	// 			38: {x: 0, z: 1},
	// 			40: {x: 0, z: -1}
	// 		};
	// 	if (typeof directions[code] != 'undefined') {
	// 		direction = directions[code];
	// 	} else {
	// 		return;
	// 	}
	// 	var x = this.player.mazePosition.x;
	// 	var z = this.player.mazePosition.z;
	// 	var target_block = this.map[x + direction.x][z + direction.z];
	// 	if (target_block === false) {
	// 		// If the player moves forward, adds a block to the path
	// 		if (this.player.path[x + direction.x][z + direction.z] === false) {
	// 			// Builds the mesh
	// 			this.player.path[x][z] = new THREE.Mesh(new THREE.CubeGeometry(this.thickness, this.thickness / 4, this.thickness, 1, 1, 1), this.materials.red);
	// 			this.player.path[x][z].position.set(-((this.side * this.thickness) / 2) + x * this.thickness, this.thickness * 5, -((this.side * this.thickness) / 2) + z * this.thickness);
	// 			this.player.path[x][z].scale.set(0, 0, 0);
	// 			this.scene.add(this.player.path[x][z]);
	//
	// 			// Builds the related tween
	// 			var tween = new TWEEN.Tween({scale: 0, y: this.thickness * 5, mesh: this.player.path[x][z]}).to({
	// 				scale: 1,
	// 				y: this.thickness / 8
	// 			}, 300).delay(150);
	// 			tween.onUpdate(function () {
	// 				this.mesh.scale.set(this.scale, this.scale, this.scale);
	// 				this.mesh.position.y = this.y;
	// 			});
	// 			tween.start();
	// 		}
	// 		// If he goes back, removes one
	// 		else {
	// 			this.removePlayerPath(x + direction.x, z + direction.z, 0);
	// 		}
	//
	// 		// Updates the player position
	// 		this.player.mazePosition.x += direction.x;
	// 		this.player.mazePosition.z += direction.z;
	//
	// 		// this.movePlayer(true);
	// 	}
	// };

	ThreeDance.prototype.movePlayer = function (animate) {
		// var from = {height: -Math.PI, x: this.player.position.x, z: this.player.position.z, mesh: this.player};
		// var to = {
		// 	height: Math.PI,
		// 	x: -((this.side * this.thickness) / 2) + this.player.mazePosition.x * this.thickness,
		// 	z: -((this.side * this.thickness) / 2) + this.player.mazePosition.z * this.thickness
		// };
		// var tween = new TWEEN.Tween(from).to(to, animate ? 300 : 0);
		// var self = this;
		// tween.onUpdate(function () {
		// 	this.mesh.position.x = this.x;
		// 	this.mesh.position.y = (Math.cos(this.height) + 1) * (self.thickness / 4);
		// 	this.mesh.position.z = this.z;
		// });
		// // End of the maze: starts again
		// tween.onComplete(function () {
		// 	if (self.player.mazePosition.x === 2 && self.player.mazePosition.z === 2) {
		// 		self.onGenerateMaze();
		// 	}
		// });
		// tween.start();
	};

	window.ThreeDance = ThreeDance;

})(window);


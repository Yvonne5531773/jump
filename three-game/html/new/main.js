var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var SPEED = 0.01;
var mesh = null;

var cube = [];
var fo = {};
var nx = 100,
	ny = 100,
	size = 20,
	start_point_x = 0,
	start_point_y = 0;
var len = 1,
	head_pos_x = 0,  //开始X
	head_pos_y = 0, //开始Y
	head_for = 2;    //方向
var dir_x = [0, 0, 1, 0]
// var dir_x = [0, -1, 1, 0]
var dir_y = [1, 0, 1, -1]
// var dir_x = [1, -1, 0, 0]
// var dir_y = [0, 0, 1, -1]
var status = -1;
var pause_flag = false;
var board = []
var the_last_head = head_for;
var snake = []
var aRequest, gameover = false, cameraHelper

init();
// run();
onWindowResize()

function init() {
	scene = new THREE.Scene();

	initMesh();
	initCamera();
	initLights();
	initRenderer();

	for (i = 0; i < nx; i++) {
		board[i] = []
		for (k = 0; k < ny; k++) {
			board[i][k] = 0;
		}
	}
	for (let i = 0; i < len; i++) {
		snake[i] = {}
		snake[i].x = head_pos_x + i * dir_x[3 - head_for];
		snake[i].y = head_pos_y + i * dir_y[3 - head_for];
		cube[i] = initCube(.1, .1, .1)
		cube[i].position.x = snake[i].x * .1 - start_point_x;
		cube[i].position.y = -snake[i].y * .1 + start_point_y;
		cube[i].castShadow = true;
		// cube[i].position.set(10, 0, 0)
		// cube[i].rotation.y = -0.8
		scene.add(cube[i]);
		board[snake[i].x][snake[i].y] = 1;
	}
	fo = initCube(.1, .1, .3);
	fo.castShadow = true;
	scene.add(fo);

	status = 0;
	pause_flag = false;
	food();
	run();

	document.body.appendChild(renderer.domElement);
	document.addEventListener('keydown', onKeyDown, false);
}

function initCamera() {
	// camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 1, 10);
	// camera.position.set(0, 3.5, 5);
	// camera.lookAt(scene.position);
	camera = new THREE.PerspectiveCamera(55, 1, 1, 2000);
	camera.position.set(0, 3.5, 4);
	camera.up.x = 0;
	camera.up.y = 0;
	camera.up.z = 0;
	camera.lookAt({x: 0, y: 0, z: 0});
}

function initRenderer() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
}

function initLights() {
	var light = new THREE.DirectionalLight('#fffbbc');
	// light.position.set(1, 1, .5); //颜色渐变
	// light.castShadow = true;
	// light.distance = 0;
	// light.intensity = 0.8;
	// light.shadowMapHeight = 2048;
	// light.shadowMapWidth = 2048;
	scene.add(light);
}

function initMesh() {
	var loader = new THREE.JSONLoader();
	loader.load('1.json', function(geometry, materials) {  //路障
		mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.06;
		mesh.translation = THREE.GeometryUtils.center(geometry);
		mesh.rotation.y = 3.1;
		scene.add(mesh);
	});
}

function initCube(_s1, _s2, _s3) {
  return new THREE.Mesh(new THREE.CubeGeometry(_s1, _s2, _s3, 1, 1, 1), new THREE.MeshNormalMaterial({color: '#ffe3ae' }));
}

function render() {
	for (let i = 0; i < len; ++i) {
		cube[i].position.x = snake[i].x * 0.1 - start_point_x;
		cube[i].position.y = 0.5;
		cube[i].position.z = -snake[i].y * 0.1

		cube[i].rotation.y = -0.8
		console.log('cube[i]', cube[i])
	}
	camera.position.x = 0
	camera.position.z = 3.5  //随着线的运动，镜头跟着走
	renderer.render(scene, camera);
}

var fps = 25;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;
function run() {
	aRequest = window.requestAnimationFrame(run);
	// TWEEN.update();
	now = Date.now();
	delta = now - then;
	if (delta > interval) {
		then = now - (delta % interval);
		if (!pause_flag)
			move();
		render();
		if(gameover)
			window.cancelAnimationFrame(aRequest)
	}
}

function move() {
	var tx = snake[0].x + dir_x[head_for];
	var ty = snake[0].y + dir_y[head_for];
	if (tx >= 0 && tx < nx && ty >= 0 && ty < ny) {
		if (board[tx][ty] !== 1) {
			the_last_head = head_for;
			snake[len] = {}
			snake[len].x = snake[len - 1].x;
			snake[len].y = snake[len - 1].y;
			cube[len] = initCube(.1, .1, .1);
			// cube[len].position.x = snake[len].x * 10 - start_point_x;
			// cube[len].position.y = -snake[len].y * 10 + start_point_y;
			cube[len].castShadow = true;
			scene.add(cube[len]);
			board[tx][ty] = 1;
			len++;
			if (board[tx][ty] === 2) {
				snake[len] = {}
				snake[len].x = snake[len - 1].x;
				snake[len].y = snake[len - 1].y;
				cube[len] = initCube(.1, .1, .1);
				cube[len].position.x = snake[len].x * 10 - start_point_x;
				cube[len].position.y = -snake[len].y * 10 + start_point_y;
				cube[len].castShadow = true;
				scene.add(cube[len]);
				board[tx][ty] = 1;
				len++;
				food();
			}
			for (let i = len - 1; i > 0; i--) {
				snake[i].x = snake[i - 1].x;
				snake[i].y = snake[i - 1].y;
			}
			snake[0].x = tx;
			snake[0].y = ty;
		}
		else {
			if (the_last_head + head_for !== 3) {
				console.log('over 1')
				over()
			} else {
				head_for = the_last_head;
			}
		}
	} else {
		console.log('over 2')
		over()
	}
	for (let i = 0; i < nx; i++) {
		for (let k = 0; k < ny; k++) {
			if (board[i][k] == 1)
				board[i][k] = 0;
		}
	}
	for (let i = 0; i < len; i++) {
		board[snake[i].x][snake[i].y] = 1;
	}
}

function food() {
	var tx, ty;
	do {
		tx = Math.ceil(Math.random() * 1000) % nx;
		ty = Math.ceil(Math.random() * 1000) % ny;
	} while (board[tx][ty]);
	board[tx][ty] = 2;
	fo.position.x = tx * 10 - start_point_x;
	fo.position.y = -ty * 10 + start_point_y;
	fo.position.z = 20;
}

function onKeyDown(event) {
	if (status == -1) {
		status = 0;
		food();
		run();
	}
	if (window.event){
		keynum = event.keyCode;
	}
	else if (event.which) {
		keynum = event.which;
	}
	if (keynum == 38 && head_for != 0)
		head_for = 3;
	if (keynum == 40 && head_for != 3)
		head_for = 0;
	if (keynum == 37 && head_for != 2)
		head_for = 1;
	if (keynum == 39 && head_for != 1)
		head_for = 2;
	if (keynum == 80)
		pause_flag = !pause_flag;
	if (keynum != 80)
		pause_flag = false;
}

function over() {
	console.log("game over!\ryour score is " + len);
	gameover = true
}

function onWindowResize() {
	var width = window.innerWidth || window.document.body.clientWidth;
	var height = window.innerHeight || window.document.body.clientHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}

function rotateMesh() {
	if (!mesh) {
		return;
	}
	mesh.rotation.x -= SPEED * 2;
	mesh.rotation.y -= SPEED;
	mesh.rotation.z -= SPEED * 3;
}

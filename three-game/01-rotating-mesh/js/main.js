var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var SPEED = 0.01;

function init() {
	scene = new THREE.Scene();

	initMesh();
	initCamera();
	initLights();
	initRenderer();

	document.body.appendChild(renderer.domElement);
}

function initCamera() {
	// camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 1, 10);
	// camera.position.set(0, 3.5, 5);
	// camera.lookAt(scene.position);
	camera = new THREE.PerspectiveCamera(75, 1, 1, 1000);
	camera.position.set(1, 6.5, 3);
	// camera.position.x = -100;
	// camera.position.y = -100;
	// camera.position.z = 800; //俯视的高度
	camera.up.x = 0;
	camera.up.y = 0;
	camera.up.z = 0;
	camera.lookAt({x: 0, y: 0, z: 0});
}

function initRenderer() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(WIDTH, HEIGHT);
}

function initLights() {
	var light = new THREE.AmbientLight(0xffffff);
	scene.add(light);
}

var mesh = null;
function initMesh() {
	var loader = new THREE.JSONLoader();
	// loader.load('./1.json', function(geometry, materials) {  //路障
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.03;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// 	mesh.rotation.x -= 3;
	// });
	// loader.load('./2.json', function(geometry, materials) {  //皇冠
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./3.json', function(geometry, materials) {  //宝石
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./4.json', function(geometry, materials) {  //单路障
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.05;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// 	mesh.rotation.x -= 3;
	// });
	// loader.load('./5.json', function(geometry, materials) {  //垂直线
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./6.json', function(geometry, materials) {  //钢琴粗黑条
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	loader.load('./7.json', function(geometry, materials) { //钢琴细黑条
		mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;
		mesh.translation = THREE.GeometryUtils.center(geometry);
		scene.add(mesh);
	});
	// loader.load('./8.json', function(geometry, materials) {  //三角
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./9.json', function(geometry, materials) {   //方块
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.01;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./10.json', function(geometry, materials) {  //钢琴中黑条
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./11.json', function(geometry, materials) {
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.5;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./12.json', function(geometry, materials) {  //路障
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.05;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// 	mesh.rotation.x -= 3;
	// 	// mesh.rotation.z -= 2;
	// });
	// loader.load('./13.json', function(geometry, materials) {  //右路障
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.04;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// 	// mesh.rotation.x -= 3;
	// });
	// loader.load('./14.json', function(geometry, materials) {
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.001;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// loader.load('./15.json', function(geometry, materials) {  //钻石
	// 	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 15;
	// 	mesh.translation = THREE.GeometryUtils.center(geometry);
	// 	scene.add(mesh);
	// });
	// let cube = initCube(1, 1, 1)
	// scene.add(cube);
	// cube.rotation.y = -2
}

function initCube(_s1, _s2, _s3) {
  return new THREE.Mesh(new THREE.CubeGeometry(_s1, _s2, _s3, 1, 1, 1), new THREE.MeshNormalMaterial({color: '#ffe3ae' }));
}

function rotateMesh() {
	if (!mesh) {
		return;
	}

	mesh.rotation.x -= SPEED * 2;
	mesh.rotation.y -= SPEED;
	mesh.rotation.z -= SPEED * 3;
}

function render() {
	requestAnimationFrame(render);
	// rotateMesh();
	renderer.render(scene, camera);
}

init();
render();

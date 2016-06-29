var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.z = 100;
scene.add( camera );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

var geom = new THREE.Geometry();
var v1 = new THREE.Vector3(0,0,0);
var v2 = new THREE.Vector3(30,0,0);
var v3 = new THREE.Vector3(30,30,0);

console.log(geom.vertices)
geom.vertices.push(v1);
geom.vertices.push(v2);
geom.vertices.push(v3);

geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
geom.computeFaceNormals();

var mesh= new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
scene.add(mesh);

renderer.render( scene, camera );

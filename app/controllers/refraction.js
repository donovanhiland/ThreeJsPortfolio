  // if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

  var container;

  var camera, scene, renderer;
  var cameraCube, sceneCube;

  var mesh, lightMesh, geometry;
  var spheres = [];

  var directionalLight, pointLight;

  var mouseX = 0, mouseY = 0;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  var timeout;

  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousedown', onDocumentMouseMove, false);
  document.addEventListener( 'mouseup', function(){clearInterval(timeout);});

  init();
  animate();

  function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.z = 3200;

    cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    scene = new THREE.Scene();
    sceneCube = new THREE.Scene();

    b = new THREE.Scene();
    e = new THREE.WebGLRenderer();
    // e.setPixelRatio(Device.pixelRatio);
    // e.setSize(Stage.width, Stage.height);
    // g = new THREE.PerspectiveCamera(60, Stage.width / Stage.height, 10, 10000);
    // g.position.z = 1400;
    // g.controls = new THREE.TrackballControls(g);
    b.add(new THREE.AmbientLight(16777215));
    var k = new Shader("Refraction", "Refraction");
    k.uniforms = {
        reflectivity: {
            type: "f",
            value: 1
        },
        refractionRatio: {
            type: "f",
            value: 0.98
        },
        envMap: {
            type: "t",
            value: Utils3D.getCubemap("assets/images/temp/bg.jpg")
        },
    };
    var j = new THREE.CubeGeometry(500, 500, 500);
    var l = new THREE.Mesh(j, k.material);
    h.delayedCall(function() {}, 400);
    b.add(l);
    f.add(e.domElement);

    var triXPos,
        triYPos;

    for ( var i = 0; i < 10; i ++ ) {
      xPos1 = Math.floor((Math.random() * 500) - 250);
      yPos1 = Math.floor((Math.random() * 500) - 250);
      xPos2 = Math.floor((Math.random() * 500) - 250);
      yPos2 = Math.floor((Math.random() * 500) - 250);
      var geometry = new THREE.Geometry();
      var v1 = new THREE.Vector3(0,0,0);
      var v2 = new THREE.Vector3(xPos1,yPos1,0);
      var v3 = new THREE.Vector3(xPos2,yPos2,0);

      geometry.vertices.push(v1);
      geometry.vertices.push(v2);
      geometry.vertices.push(v3);

      geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
      geometry.computeFaceNormals();
      console.log(geometry.vertices);
      var mesh = new THREE.Mesh( geometry, material );

      mesh.position.x = Math.random() * 10000 - 5000;
      mesh.position.y = Math.random() * 10000 - 5000;
      // mesh.position.z = Math.random() * 10000 - 5000;

      mesh.scale.x = mesh.scale.y = mesh.scale.z = 20;
      //  Math.random() * 3 + 1;

      scene.add( mesh );

      spheres.push( mesh );

    }

    // Skybox

    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = textureCube;

    var material = new THREE.ShaderMaterial( {

      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide

    } ),

    mesh = new THREE.Mesh( new THREE.BoxGeometry( 50, 50, 50 ), material );
    sceneCube.add( mesh );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    cameraCube.aspect = window.innerWidth / window.innerHeight;
    cameraCube.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function onDocumentMouseMove(event) {
      mouseX = ( event.clientX - windowHalfX ) * 10;
      mouseY = ( event.clientY - windowHalfY ) * 10;
      $(document).on('mousemove', function() {
        mouseX = ( event.clientX - windowHalfX ) * 10;
        mouseY = ( event.clientY - windowHalfY ) * 10;
      });
  }

  //

  function animate() {

    requestAnimationFrame( animate );

    render();

  }

  function render() {

    var timer = 0.0001 * Date.now();

    for ( var i = 0, il = spheres.length; i < il; i ++ ) {

      var sphere = spheres[ i ];

      // sphere.position.x = 5000 * Math.cos( timer + i );
      // sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );

    }

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;

    camera.lookAt( scene.position );
    cameraCube.rotation.copy( camera.rotation );

    renderer.render( sceneCube, cameraCube );
    renderer.render( scene, camera );

  }

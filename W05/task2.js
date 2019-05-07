function main()
{
    document.addEventListener( 'mousedown', mouse_down_event );

    var width = 500;
    var height = 500;

    var scene = new THREE.Scene();

    var fov = 45;
    var aspect = width / height;
    var near = 1;
    var far = 1000;
    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 0, 10 );
    scene.add( camera );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    var cube = createCube(1);
    cube.geometry.center();

    scene.add(cube);

    loop();

    function loop()
    {
        requestAnimationFrame(loop);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    function mouse_down_event( event )
    {
      var x_win = event.clientX;
      var y_win = event.clientY;

      var vx = renderer.domElement.offsetLeft;
      var vy = renderer.domElement.offsetTop;
      var vw = renderer.domElement.width;
      var vh = renderer.domElement.height;
      var x_NDC = 2 * (x_win - vx) / vw - 1;
      var y_NDC = -(2 * (y_win - vy) / vh - 1);

      var p_NDC = new THREE.Vector3(x_NDC, y_NDC, 1);
      var p_wld = p_NDC.unproject(camera);

      var origin = camera.position;
      var direction = p_NDC.sub(camera.position).normalize();

      var raycaster = new THREE.Raycaster(origin, direction);
      var intersects = raycaster.intersectObject(cube);
      if (intersects.length > 0) {
        intersects[0].face.color.setHex(Math.random() * 0xffffff);
        intersects[0].object.geometry.colorsNeedUpdate = true;
      }
    }
}

function createCube(len) {
  var vertices = [
                     [0, len, 0],
                     [0, 0, 0],
                     [len, 0, 0],
                     [len, len, 0],

                     [0, len, -len],
                     [0, 0, -len],
                     [len, 0, -len],
                     [len, len, -len]
                 ];
  var faces = [
                [0, 1, 2],
                [2, 3, 0],

                [5, 4, 7],
                [7, 6, 5],

                [4, 0, 3],
                [3, 7, 4],

                [1, 5, 6],
                [6, 2, 1],

                [1, 0, 4],
                [4, 5, 1],

                [3, 2, 6],
                [6, 7, 3]
             ];

  var geometry = new THREE.Geometry();
  for (i=0; i<8; i++) {
    var v = new THREE.Vector3().fromArray(vertices[i]);
    geometry.vertices.push(v);
  }

  for (i=0; i<12; i++) {
    var id = faces[i];
    var f = new THREE.Face3(id[0], id[1], id[2]);
    f.color = new THREE.Color((i+1)/12, 0, 0);
    geometry.faces.push(f);
  }

  var material = new THREE.MeshBasicMaterial();
  material.vertexColors = THREE.FaceColors;

  material.side = THREE.FrontSide;
  var cube = new THREE.Mesh( geometry, material );

  return cube;
}

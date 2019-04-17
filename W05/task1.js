function main()
{
    var width = 500;
    var height = 500;

    var scene = new THREE.Scene();

    var fov = 45;
    var aspect = width / height;
    var near = 1;
    var far = 1000;
    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 0, 5 );
    scene.add( camera );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    var vertices = [
                     [
                       [1, 1, 0]
                       [-1, 1, 0],
                       [1, -1, 0],
                       [-1, -1, 0]
                     ],
                     [
                       [1, 1, 0]
                       [-1, 1, 0],
                       [1, -1, 0],
                       [-1, -1, 0]
                     ],
                     [
                       [1, 1, 0]
                       [-1, 1, 0],
                       [1, -1, 0],
                       [-1, -1, 0]
                     ],
                     [
                       [1, 1, 0]
                       [-1, 1, 0],
                       [1, -1, 0],
                       [-1, -1, 0]
                     ]
                   ];
    var faces = [[0, 1, 2]];

    var v0 = new THREE.Vector3().fromArray(vertices[0]);
    var v1 = new THREE.Vector3().fromArray(vertices[1]);
    var v2 = new THREE.Vector3().fromArray(vertices[2]);
    var id = faces[0];
    var f0 = new THREE.Face3(id[0], id[1], id[2]);

    var geometry = new THREE.Geometry();
    geometry.vertices.push(v0);
    geometry.vertices.push(v1);
    geometry.vertices.push(v2);
    geometry.faces.push(f0);

    var material = new THREE.MeshBasicMaterial();
    material.vertexColors = THREE.FaceColors;
    geometry.faces[0].color = new THREE.Color(1, 0, 0);

    //var material = new THREE.MeshBasicMaterial();
    //material.vertexColors = THREE.VertexColors;
    //geometry.faces[0].vertexColors.push(new THREE.Color(1,0,0));
    //geometry.faces[0].vertexColors.push(new THREE.Color(0,1,0));
    //geometry.faces[0].vertexColors.push(new THREE.Color(0,0,1));

    //geometry.computeFaceNormals();
    //material.side = THREE.DoubleSide();

    var cube = new THREE.Mesh( geometry, material );

    scene.add(cube);

    loop();

    function loop()
    {
        requestAnimationFrame( loop );
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render( scene, camera );
    }
}

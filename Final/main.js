function main()
{
    var volume = new KVS.LobsterData();
    var screen = new KVS.THREEScreen();

    screen.init( volume, {
        width: document.body.display.offsetWidth,
        //height: window.innerHeight,
        targetDom: document.body.display,
        enableAutoResize: false
    });

    var light = new THREE.PointLight();
    light.position.set( 5, 5, 5 );
    screen.scene.add( light );

    var bounds = Bounds( volume );
    screen.scene.add( bounds );

    var isovalue = 128;
    var material;
    var transfer_function;

    var surfaces = Isosurfaces( volume, isovalue, material, transfer_function );
    screen.scene.add( surfaces );

    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });

    window.addEventListener( 'resize', function() {
        screen.resize( [ window.innerWidth, window.innerHeight ] );
    });

    screen.loop();
}

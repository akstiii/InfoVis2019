function main()
{
    var volume = new KVS.LobsterData();
    var screen = new KVS.THREEScreen();

    screen.init( volume, {
        width: window.innerWidth,
        height: window.innerHeight,
        enableAutoResize: false
    });

    var light = new THREE.PointLight();
    light.position.set( 5, 5, 5 );
    screen.scene.add( light );

    var bounds = Bounds( volume );
    screen.scene.add( bounds );

    var isovalue = 80;
    var surfaces = Isosurfaces( volume, isovalue, light );
    screen.scene.add( surfaces );

    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });

    window.addEventListener( 'resize', function() {
        screen.resize( [ window.innerWidth, window.innerHeight ] );
    });

    screen.loop();
}

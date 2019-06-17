function Arrows(scene, volume, step) {
  var dimz = volume.resolution.z;
  var dimy = volume.resolution.y;
  var dimx = volume.resolution.x;
  for ( var k = 0; k < dimz; k=k+step )
  {
    for ( var j = 0; j < dimy; j=j+step )
    {
      for ( var i = 0; i < dimx; i=i+step )
      {
        var val = volume.values[k*dimz+j*dimy+dimx];

        var v = new THREE.Vector3().fromArray(val);

        var dir = v.normalize();
        var origin = new THREE.Vector3(i, j, k);
        var length = v.length() * 10;
        var hex = 0xffff00;

        var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
        scene.add( arrowHelper );
      }
    }
  }
}

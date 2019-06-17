function Slice(volume, point, normal, transfer_function)
{
    var w = point.clone().multiplyScalar(-1).dot(normal);
    var coef = new THREE.Vector4(normal.x, normal.y, normal.z, w);

    var geometry = new THREE.Geometry();
    material = new THREE.MeshBasicMaterial();
    material.vertexColors = THREE.VertexColors;
    material.side = THREE.DoubleSide;

    if (typeof transfer_function === 'undefined') {
      transfer_function = rainbow_transfer_function;
    }

    var smin = volume.min_value;
    var smax = volume.max_value;

    var lut = new KVS.MarchingCubesTable();
    var cell_index = 0;
    var counter = 0;
    for ( var z = 0; z < volume.resolution.z - 1; z++ )
    {
        for ( var y = 0; y < volume.resolution.y - 1; y++ )
        {
            for ( var x = 0; x < volume.resolution.x - 1; x++ )
            {
                var index = table_index(x, y, z);
                if (index == 0) { continue; }
                if (index == 255) { continue; }

                for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
                {
                    var eid0 = lut.edgeID[index][j];
                    var eid1 = lut.edgeID[index][j+2];
                    var eid2 = lut.edgeID[index][j+1];

                    var vid0 = lut.vertexID[eid0][0];
                    var vid1 = lut.vertexID[eid0][1];
                    var vid2 = lut.vertexID[eid1][0];
                    var vid3 = lut.vertexID[eid1][1];
                    var vid4 = lut.vertexID[eid2][0];
                    var vid5 = lut.vertexID[eid2][1];

                    var v0 = new THREE.Vector3(x + vid0[0], y + vid0[1], z + vid0[2]);
                    var v1 = new THREE.Vector3(x + vid1[0], y + vid1[1], z + vid1[2]);
                    var v2 = new THREE.Vector3(x + vid2[0], y + vid2[1], z + vid2[2]);
                    var v3 = new THREE.Vector3(x + vid3[0], y + vid3[1], z + vid3[2]);
                    var v4 = new THREE.Vector3(x + vid4[0], y + vid4[1], z + vid4[2]);
                    var v5 = new THREE.Vector3(x + vid5[0], y + vid5[1], z + vid5[2]);

                    var v01 = interpolated_vertex(v0, v1);
                    var v23 = interpolated_vertex(v2, v3);
                    var v45 = interpolated_vertex(v4, v5);

                    geometry.vertices.push(v01);
                    geometry.vertices.push(v23);
                    geometry.vertices.push(v45);

                    var id0 = counter++;
                    var id1 = counter++;
                    var id2 = counter++;

                    var val0 = interpolated_value(v0, v1);
                    var val1 = interpolated_value(v0, v1);
                    var val2 = interpolated_value(v0, v1);

                    var c0 = transfer_function(val0, smin, smax);
                    var c1 = transfer_function(val1, smin, smax);
                    var c2 = transfer_function(val2, smin, smax);

                    var f = new THREE.Face3(id0, id1, id2);
                    f.vertexColors = [c0, c1, c2]

                    geometry.faces.push(f);
                }
            }
            cell_index++;
        }
        cell_index += volume.resolution.x;
    }

    geometry.computeVertexNormals();

    return new THREE.Mesh( geometry, material );

    function table_index(x, y, z)
    {
      var s0 = plane_function(x,     y,     z    );
      var s1 = plane_function(x + 1, y,     z    );
      var s2 = plane_function(x + 1, y + 1, z    );
      var s3 = plane_function(x,     y + 1, z    );
      var s4 = plane_function(x,     y,     z + 1);
      var s5 = plane_function(x + 1, y,     z + 1);
      var s6 = plane_function(x + 1, y + 1, z + 1);
      var s7 = plane_function(x,     y + 1, z + 1);

      var index = 0;
      if (s0 > 0) { index |=   1; }
      if (s1 > 0) { index |=   2; }
      if (s2 > 0) { index |=   4; }
      if (s3 > 0) { index |=   8; }
      if (s4 > 0) { index |=  16; }
      if (s5 > 0) { index |=  32; }
      if (s6 > 0) { index |=  64; }
      if (s7 > 0) { index |= 128; }

      return index;
    }

    function interpolated_vertex(v0, v1)
    {
      var s0 = plane_function(v0.x, v0.y, v0.z);
      var s1 = plane_function(v1.x, v1.y, v1.z);
      var a = Math.abs(s0 / (s1 - s0));

      var x = KVS.Mix(v0.x, v1.x, a);
      var y = KVS.Mix(v0.y, v1.y, a);
      var z = KVS.Mix(v0.z, v1.z, a);

      return new THREE.Vector3(x, y, z);
    }

    function interpolated_value(v0, v1) {
      var s0 = plane_function(v0.x, v0.y, v0.z);
      var s1 = plane_function(v1.x, v1.y, v1.z);
      var a = Math.abs(s0 / (s1 - s0));

      var id0 = index_of(v0);
      var id1 = index_of(v1);

      return KVS.Mix(volume.values[id0][0], volume.values[id1][0], a);
    }

    function index_of(v)
    {
      var nlines = volume.numberOfNodesPerLine();
      var nslices = volume.numberOfNodesPerSlice();
      return v.x + v.y * nlines + v.z * nslices;
    }

    function plane_function(x, y, z) {
      return coef.x * x + coef.y * y + coef.z * z + coef.w;
    }
}

function rainbow_transfer_function(val, min, max) {
   var lut = new THREE.Lut("rainbow", 256);
   lut.setMin(min);
   lut.setMax(max);
   return lut.getColor(val);
}

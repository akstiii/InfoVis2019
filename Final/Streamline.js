var AKST = {
}
AKST.Streamlines = function(volume, options) {
  var streamline = new AKST.Streamline();
  streamline.setStepLength(0.1);
  streamline.setTime(5000);
  streamline.setMethod(AKST.RungeKutta4);
  streamline.setLineWidth(5);

  var seeds = [];
  if (options["seeds"] !== undefined) {
    seeds = options["seeds"];
  } else {
    var start = options["start"];
    var end = options["end"];
    var steps = options["steps"];

    var cur = start.clone();
    var len = end.clone().sub(start);
    var step = len.divideScalar(steps);
    for (var n = 0; n < steps; n++) {
      seeds.push(cur);
      cur = cur.clone().add(step);
    }
  }

  var lines = [];

  for (var i = 0; i < seeds.length; i++) {
    streamline.setSeedPoint(seeds[i]);
    streamline.setDirection(AKST.Direction.FORWARD);
    var forward = streamline.run(volume);
    lines.push(forward);

    streamline.setDirection(AKST.Direction.BACKWARD);
    var backward = streamline.run(volume);
    lines.push(backward);
  }

  return [lines, seeds];
}

AKST.Streamline = function() {
  this.line_width = 1;
  this.seed = new THREE.Vector3();
  this.step_length = 0.5;
  this.time = 300;
  this.method = AKST.RungeKutta4;
  this.direction = AKST.Direction.FORWARD;
}

AKST.Streamline.prototype =
{
  constructor: AKST.Streamline,

  setLineWidth: function(width)
  {
      this.line_width = width;
  },

  setSeedPoint: function(p)
  {
      this.seed_point = p;
  },

  setStepLength: function(length)
  {
      this.length = length;
  },

  setTime: function(time)
  {
      this.time = time;
  },

  setMethod: function(method)
  {
      this.method = method;
  },

  setDirection: function(direction)
  {
      this.direction = direction;
  },

  run: function(volume) {
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({linewidth: this.line_width});
    material.vertexColors = THREE.VertexColors;

    if (!valid_point(this.seed_point))
    {
        return line;
    }

    var point = this.seed_point;

    var value = interpolated_value(point);
    var color = interpolated_color(value);
    geometry.vertices.push(point);
    geometry.colors.push(color);

    var method = this.method;
    var step_length = this.step_length * this.direction;
    for (var i = 0; i < this.time; i++)
    {
        point = next_point(point, step_length, method);
        if (!valid_point(point)) {
          break;
        }

        value = interpolated_value(point);
        color = interpolated_color(value);

        geometry.vertices.push(point);
        geometry.colors.push(color);
    }

    return new THREE.Line(geometry, material, THREE.LineStrip);

    function next_point(p, step_length, method)
    {
      return method(p, step_length, interpolated_value, valid_point);
    }


    function interpolated_value(p)
    {
        var cell = new THREE.Vector3(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z));
        var indices = cell_node_indices(index_of(cell));

        var local = p.clone().sub(cell);
        var N = interpolation_function(local);

        var ret = new THREE.Vector3();
        for ( var i = 0; i < 8; i++ )
        {
            var v = new THREE.Vector3().fromArray(volume.values[indices[i]]);
            ret.add(v.multiplyScalar(N[i]));
        }

        return ret;

        function index_of(cell)
        {
            var dim = volume.resolution;
            return cell.x + dim.x * cell.y + dim.x * dim.y * cell.z;
        }

        function cell_node_indices(cell_index)
        {
            var lines = volume.numberOfNodesPerLine();
            var slices = volume.numberOfNodesPerSlice();

            var id0 = cell_index;
            var id1 = id0 + 1;
            var id2 = id1 + lines;
            var id3 = id0 + lines;
            var id4 = id0 + slices;
            var id5 = id1 + slices;
            var id6 = id2 + slices;
            var id7 = id3 + slices;

            return [id0, id1, id2, id3, id4, id5, id6, id7];
        }

        function interpolation_function( p )
        {
            var x = p.x;
            var y = p.y;
            var z = p.z;

            var N0 = (1 - x) * (1 - y) * z;
            var N1 = x * (1 - y) * z;
            var N2 = x * y * z;
            var N3 = (1 - x) * y * z;
            var N4 = (1 - x) * (1 - y) * (1 - z);
            var N5 = x * (1 - y) * (1 - z);
            var N6 = x * y * (1 - z);
            var N7 = (1 - x) * y * (1 - z);

            return [ N0, N1, N2, N3, N4, N5, N6, N7 ];
        }
    }

    function interpolated_color(v)
    {
        var smin = volume.min_value;
        var smax = volume.max_value;
        return rainbow_transfer_function(v.length(), smin, smax);
    }

    function rainbow_transfer_function(val, min, max) {
       var lut = new THREE.Lut("rainbow", 256);
       lut.setMin(min);
       lut.setMax(max);
       return lut.getColor(val);
    }

    function valid_point(p)
    {
        var resx = volume.resolution.x;
        var resy = volume.resolution.y;
        var resz = volume.resolution.z;

        if (p.x < 0 || p.x > resx-1) return false;
        if (p.y < 0 || p.y > resy-1) return false;
        if (p.z < 0 || p.z > resz-1) return false;

        return true;
    }
  }
}

AKST.RungeKutta4 = function(p, step_length, f, fv) {
  var h = step_length;
  var y = p;

  // k1 = h * f(y)
  var k1 = f(y).multiplyScalar(h);

  // k2 = h * f(y + k1/2)
  var v2 = y.clone().add(k1.clone().divideScalar(2));
  if (!fv(v2)) { return p; }
  var k2 = f(v2).multiplyScalar(h);

  // k3 = h * f(y + k2/2)
  var v3 = y.clone().add(k2.clone().divideScalar(2));
  if (!fv(v3)) { return p; }
  var k3 = f(v3).multiplyScalar(h);

  // k4 = h * f(y + k3)
  var v4 = y.clone().add(k3);
  if (!fv(v4)) { return p; }
  var k4 = f(v4).multiplyScalar(h);

  // y + 1/6 * ( k1 + 2*k2 + 2*k3 + k4 )
  var tmp1 = k2.clone().add(k3).multiplyScalar(2);
  var tmp2 = k1.clone().add(tmp1).add(k4).divideScalar(6);
  return y.clone().add(tmp2);
}

AKST.Direction = {
  FORWARD: 1,
  BACKWARD: -1
}

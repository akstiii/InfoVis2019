// Constructor
Vec3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

//Add method
Vec3.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
}

//Sum method
Vec3.prototype.sum = function() {
    return this.x + this.y + this.z;
}

Vec3.prototype.min = function() {
    return Math.min(Math.min(this.x, this.y), this.z);
}

Vec3.prototype.max = function() {
    return Math.max(Math.max(this.x, this.y), this.z);
}

Vec3.prototype.mid = function() {
    var temp = [this.x, this.y, this.z];
    temp.sort();
    return temp[1];
}

Vec3.prototype.dis = function(v) {
	var xd = this.x - v.x;
	var yd = this.y - v.y;
	var zd = this.z - v.z;
	var sum = Math.pow(xd, 2) + Math.pow(yd, 2) + Math.pow(zd, 2);
	return Math.sqrt(sum);
}

function AreaOfTriangle(v0, v1, v2) {
	var v01 = v0.dis(v1);
	var v02 = v0.dis(v2);
	return 0.5*Math.abs(v01*v02);
}
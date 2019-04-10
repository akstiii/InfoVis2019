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

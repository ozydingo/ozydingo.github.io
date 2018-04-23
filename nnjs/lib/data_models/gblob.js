if (nnjs.DataModels === undefined) { nnjs.DataModels = {}; }
nnjs.DataModels.GBlob = function(mx, sx, my, sy) {
  this.mx = mx;
  this.sx = sx;
  this.my = my;
  this.sy = sy;
};

nnjs.DataModels.GBlob.prototype = {
  generate: function(n) {
    var data = new Array(n);
    for (var ii=0; ii<n; ii++) {
      data[ii] = [
        this.mx + (math.random()-0.5) * this.sx,
        this.my + (math.random()-0.5) * this.sy,
      ];
    }
    return data;
  },
};

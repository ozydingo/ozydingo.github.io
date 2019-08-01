export class GBlob {
  constructor(mx, sx, my, sy) {
    this.mx = mx;
    this.sx = sx;
    this.my = my;
    this.sy = sy;
  }

  generate(n) {
    var data = new Array(n);
    for (var ii=0; ii<n; ii++) {
      data[ii] = [
        this.mx + (math.random()-0.5) * this.sx,
        this.my + (math.random()-0.5) * this.sy,
      ];
    }
    return data;
  }
};

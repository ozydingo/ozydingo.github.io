export class Ring {
  constructor(mx, my, min_r, max_r) {
    this.mx = mx;
    this.my = my;
    this.min_r = min_r;
    this.max_r = max_r;
  }

  generate(n) {
    var data = new Array(n);
    var rr, th
    for (var ii = 0; ii<n; ii++) {
      rr = this.min_r + (this.max_r - this.min_r) * math.random();
      th = 2 * math.pi * math.random();
      data[ii] = [
        this.mx + rr * math.sin(th),
        this.my + rr * math.cos(th)
      ];
    }

    return data;
  }
};

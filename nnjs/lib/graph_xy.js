nnjs.GraphXY = function(div) {
  if (!div || div.tagName !== 'DIV') { throw 'nnjs.GraphXY requires a div element'; }

  this.div = div;
  this.canvas = document.createElement("canvas");
  div.appendChild(this.canvas);
  this.cursor = this.canvas.getContext("2d");
  this.axes = {
    display: false,
    xlim: [-1, 1],
    ylim: [-1, 1],
    zlim: [-1, 1],
  }
  this.drawings = [];
  this.colormap = new nnjs.Colormap('yuletide');

  this.clear_canvas();
};

nnjs.GraphXY.prototype = {
  axis: function(val) {
    if (val === undefined) { return this.axes; }
    this.axes.display = !!val;
    this.redraw();
    return this.axes;
  },

  path: function(path) {
    this.validate_path(path);
    this.drawings[this.drawings.length] = {type: 'path', data: path};
    this.draw_path(path);
  },

  matrix: function(x, y, z) {
    this.validate_matrix(x, y, z);
    this.drawings[this.drawings.length] = {type: 'matrix', data: {x: x, y: y, z: z}};
    this.draw_matrix(x, y, z);
  },

  xlim: function(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid xlim: numeric type required.'
    }
    this.axes.xlim = [low, high];
    this.redraw();
  },

  ylim: function(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid ylim: numeric type required.'
    }
    this.axes.ylim = [low, high];
    this.redraw();
  },

  zlim: function(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid zlim: numeric type required.'
    }
    this.axes.zlim = [low, high];
    this.redraw();
  },

  //---------private-ish-----------//

  clear_canvas: function() {
    this.canvas.width = this.canvas.width;
  },

  redraw: function() {
    var graph = this;
    this.clear_canvas();
    if (this.axes.display) { this.draw_axes(); }
    this.drawings.forEach(function(drawing) {
      if (drawing.type === 'path') {
        graph.draw_path(drawing.data);
      } else if (drawing.type === 'matrix') {
        graph.matrix(drawing.data.x, drawing.data.y, drawing.data.z);
      }
    });
  },

  draw_axes: function () {
    this.draw_path([[this.axes.xlim[0], 0], [this.axes.xlim[1], 0]]);
    this.draw_path([[0, this.axes.ylim[0]], [0, this.axes.ylim[1]]]);
  },

  draw_path: function(path) {
    var graph = this;
    var pencil_down = false;
    path.forEach(function(xy, index) {
      if (graph.is_point_in_view(xy)) {
        if (pencil_down) {
          graph.cursor.lineTo(graph.x_to_px(xy[0]), graph.y_to_px(xy[1]));
        } else {
          pencil_down = true;
          graph.cursor.moveTo(graph.x_to_px(xy[0]), graph.y_to_px(xy[1]));
        }
      } else {
        if (pencil_down) { graph.cursor.stroke(); }
        pencil_down = false
      }
    });
    if (pencil_down) { graph.cursor.stroke(); }
  },

  draw_matrix: function(x, y, z) {
    var graph = this;
    var dx = x.length <= 1 ? 1 : math.mean(x.slice(1, x.length)) - math.mean(x.slice(0, x.length - 1));
    var dy = y.length <= 1 ? 1 : math.mean(y.slice(1, y.length)) - math.mean(y.slice(0, y.length - 1));

    for (var ii = 0; ii < y.length; ii++) {
      var y0 = graph.y_to_px(ii === 0 ? y[ii] - dy : (y[ii - 1] + y[ii]) / 2);
      var y1 = graph.y_to_px(ii === y.length - 1 ? y[ii] + dy : (y[ii] + y[ii + 1]) / 2);
      var hh = y0 - y1;
      for (var jj = 0; jj < x.length; jj++) {
        var x0 = graph.x_to_px(jj === 0 ? x[jj] - dx : (x[jj - 1] + x[jj]) / 2);
        var x1 = graph.x_to_px(jj === x.length - 1 ? x[jj] + dx : (x[jj] + x[jj + 1]) / 2);
        // debugger;
        var ww = x1 - x0;
        var color = graph.z_to_color(z[ii][jj]);
        graph.cursor.fillStyle = color;
        graph.cursor.fillRect(x0, y1, ww, hh);
      }
    }
  },

  is_point_in_view: function(xy) {
    return (
      xy[0] >= this.axes.xlim[0] && xy[0] <= this.axes.xlim[1] &&
      xy[1] >= this.axes.ylim[0] && xy[1] <= this.axes.ylim[1]
    );
  },

  x_to_px: function(x) {
    return this.norm_coef(x, this.axes.xlim) * this.canvas.width;
  },

  y_to_px: function(y) {
    return (1 - this.norm_coef(y, this.axes.ylim)) * this.canvas.height;
  },

  z_to_color: function(z) {
    return this.colormap.style(this.norm_coef(z, this.axes.zlim));
  },

  norm_coef: function(q, qlim) {
    return (q - qlim[0]) / (qlim[1] - qlim[0]);
  },

  validate_path: function(path) {
    path.forEach(function(xy, idx) {
      if (
        typeof(xy) !== 'object' ||
        xy.length !== 2
      ) { throw 'Invalid path: must be array of [x,y] pairs.' }
      if (typeof(xy[0]) !== 'number' || typeof(xy[1]) !== 'number') {
        throw 'Invalid path: numeric data pairs required (received ' + typeof(xy[0]) + ', ' + typeof(xy[1]) + ').'
      }
    })
  },

  validate_matrix: function(x, y, z) {
    if (typeof(x) !== 'object' || typeof(x.length) !== 'number') { throw 'Invalid x data for matrix: expected Array'; }
    if (typeof(y) !== 'object' || typeof(y.length) !== 'number') { throw 'Invalid y data for matrix: expected Array'; }
    if (typeof(z) !== 'object' || typeof(z.length) !== 'number') { throw 'Invalid z data for matrix: expected Array'; }
    if (z.length !== y.length) { throw 'Invalid data for matrix: z must have number of rows equal to length of y'}
    z.forEach(function(z0, idx) {
      if (typeof(z0) !== 'object' || typeof(z0.length) !== 'number') { throw 'Invalid data for matrix: expected Array of Arrays'; }
      if (z0.length !== x.length) { throw 'Invalid data for matrix: length of rows in z must be equal to length of x'}
    });
  },
}

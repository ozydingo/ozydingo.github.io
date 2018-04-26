nnjs.GraphXY = function(div) {
  if (!div || div.tagName !== 'DIV') { throw 'nnjs.GraphXY requires a div element'; }

  this.div = div;

  // Create a <canvas> element inside the given div.
  this.canvas = document.createElement("canvas");
  this.canvas.setAttribute("style", "width: 100%; height: 100%");
  this.canvas.setAttribute('width', $(div).width());
  this.canvas.setAttribute('height', $(div).height());
  div.appendChild(this.canvas);

  // Store the canvas cursor for later use
  this.cursor = this.canvas.getContext("2d");

  // Define the default graph settings
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
  // Turn axis lines on or off.
  axis: function(val) {
    if (val === undefined) { return this.axes; }
    this.axes.display = !!val;
    this.redraw();
    return this.axes;
  },

  // Add a line path to the graph. path is array of [x, y] points.
  path: function(path) {
    this.validate_xy_data(path);
    this.draw_path(path);
    this.drawings[this.drawings.length] = {type: 'path', data: path};
  },

  // Draw a scatter plot.
  // xy - array of [x,y] points
  // mark - :dot for filled circles, otherwise text to print (e.g. 'X')
  // color - either a 'rgb(...)' value or a z-axis value (uses colormap)
  // size - size of drawn symbols or font size of text
  scatter: function(xy, mark, color, size) {
    this.validate_xy_data(xy);
    if (mark === ':dot') {
      this.draw_scatter_symbol(xy, mark, color, size);
    } else {
      this.draw_scatter_text(xy, mark, color, size);
    }
    this.drawings[this.drawings.length] = {type: 'scatter', data: {xy: xy, mark: mark, color: color, size: size}};
  },

  // Draw a 2D matrix using rectangles. I think there are better ways to do this.
  // x - array of x axis values
  // y - array of y-axis values
  // z - ||y||-by-||x||matrix of data (each inner array is a row on the graph)
  matrix: function(x, y, z) {
    this.validate_matrix(x, y, z);
    this.draw_matrix(x, y, z);
    this.drawings[this.drawings.length] = {type: 'matrix', data: {x: x, y: y, z: z}};
  },

  // Set the x-axis lower and upper limits
  xlim: function(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid xlim: numeric type required.'
    }
    this.axes.xlim = [low, high];
    this.redraw();
  },

  // Set the y-axis lower and upper limits
  ylim: function(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid ylim: numeric type required.'
    }
    this.axes.ylim = [low, high];
    this.redraw();
  },

  // Set the z-axis (color) lower and upper limits
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

  draw_scatter_text: function(data, mark, color, size) {
    var graph = this;
    var fill
    if (typeof(color) === 'number') {
      fill = graph.z_to_color(color);
    } else {
      fill = color;
    }
    data.forEach(function(xy, index) {
      if (!graph.is_point_in_view(xy)) { return; }
      graph.cursor.font = '' + size + 'px Arial';
      graph.cursor.fillStyle = fill;
      graph.cursor.textAlign = 'center';
      graph.cursor.fillText(mark, graph.x_to_px(xy[0]), graph.y_to_px(xy[1]));
    });
  },

  draw_scatter_symbol: function(data, mark, color, size) {
    var graph = this;
    var fill
    if (typeof(color) === 'number') {
      fill = graph.z_to_color(color);
    } else {
      fill = color;
    }
    data.forEach(function(xy, index) {
      if (!graph.is_point_in_view(xy)) { return; }
      graph.cursor.beginPath();
      graph.cursor.strokeStyle = 'rgb(0,0,0)';
      graph.cursor.fillStyle = fill;
      graph.cursor.lineWidth = 2;
      graph.cursor.arc(graph.x_to_px(xy[0]), graph.y_to_px(xy[1]), size, 0, 2*math.pi);
      graph.cursor.stroke();
      graph.cursor.fill();
    });
  },

  draw_matrix: function(x, y, z) {
    var graph = this;
    var dx = x.length <= 1 ? 1 : math.mean(x.slice(1, x.length)) - math.mean(x.slice(0, x.length - 1));
    var dy = y.length <= 1 ? 1 : math.mean(y.slice(1, y.length)) - math.mean(y.slice(0, y.length - 1));

    for (var jj = 0; jj < x.length; jj++) {
      var x0 = graph.x_to_px(jj === 0 ? x[jj] - dx : (x[jj - 1] + x[jj]) / 2);
      var x1 = graph.x_to_px(jj === x.length - 1 ? x[jj] + dx : (x[jj] + x[jj + 1]) / 2);
      var ww = x1 - x0;
      for (var ii = 0; ii < y.length; ii++) {
        var y0 = graph.y_to_px(ii === 0 ? y[ii] - dy : (y[ii - 1] + y[ii]) / 2);
        var y1 = graph.y_to_px(ii === y.length - 1 ? y[ii] + dy : (y[ii] + y[ii + 1]) / 2);
        var hh = y0 - y1;
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

  px_to_x: function(px) {
    return this.scale_norm_coef(px / this.canvas.width, this.axes.xlim);
  },

  y_to_px: function(y) {
    return (1 - this.norm_coef(y, this.axes.ylim)) * this.canvas.height;
  },

  px_to_y: function(px) {
    return this.scale_norm_coef(1 - px / this.canvas.height, this.axes.ylim);
  },

  z_to_color: function(z) {
    return this.colormap.style(this.norm_coef(z, this.axes.zlim));
  },

  norm_coef: function(q, qlim) {
    return (q - qlim[0]) / (qlim[1] - qlim[0]);
  },

  scale_norm_coef: function(qs, qlim) {
    return qs * (qlim[1] - qlim[0]) + qlim[0];
  },

  validate_xy_data: function(data) {
    data.forEach(function(xy, idx) {
      if (
        typeof(xy) !== 'object' ||
        xy.length !== 2
      ) { throw 'Invalid data: must be array of [x,y] pairs.' }
      if (typeof(xy[0]) !== 'number' || typeof(xy[1]) !== 'number') {
        throw 'Invalid data: numeric data pairs required (received ' + typeof(xy[0]) + ', ' + typeof(xy[1]) + ').'
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

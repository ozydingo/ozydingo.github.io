import { ColorMap } from './color_map.js'

export class GraphXY {
  constructor(div) {
    if (!div || div.tagName !== 'DIV') { throw 'GraphXY requires a div element'; }

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
    this.colormap = new ColorMap('yuletide');

    this.clear_canvas();
  }

  // Turn axis lines on or off.
  axis(val) {
    if (val === undefined) { return this.axes; }
    this.axes.display = !!val;
    this.redraw();
    return this.axes;
  }

  // Add a line path to the graph. path is array of [x, y] points.
  path(path) {
    this.validate_xy_data(path);
    this.draw_path(path);
    this.drawings[this.drawings.length] = {type: 'path', data: path};
  }

  // Draw a scatter plot.
  // xy - array of [x,y] points
  // mark - :dot for filled circles, otherwise text to print (e.g. 'X')
  // color - either a 'rgb(...)' value or a z-axis value (uses colormap)
  // size - size of drawn symbols or font size of text
  scatter(xy, mark, color, size) {
    this.validate_xy_data(xy);
    if (mark === ':dot') {
      this.draw_scatter_symbol(xy, mark, color, size);
    } else {
      this.draw_scatter_text(xy, mark, color, size);
    }
    this.drawings[this.drawings.length] = {type: 'scatter', data: {xy: xy, mark: mark, color: color, size: size}};
  }

  // Draw a 2D matrix using rectangles. I think there are better ways to do this.
  // x - array of x axis values
  // y - array of y-axis values
  // z - ||y||-by-||x||matrix of data (each inner array is a row on the graph)
  matrix(x, y, z) {
    this.validate_matrix(x, y, z);
    this.draw_matrix(x, y, z);
    this.drawings[this.drawings.length] = {type: 'matrix', data: {x: x, y: y, z: z}};
  }

  // Set the x-axis lower and upper limits
  xlim(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid xlim: numeric type required.'
    }
    this.axes.xlim = [low, high];
    this.redraw();
  }

  // Set the y-axis lower and upper limits
  ylim(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid ylim: numeric type required.'
    }
    this.axes.ylim = [low, high];
    this.redraw();
  }

  // Set the z-axis (color) lower and upper limits
  zlim(low, high) {
    if (typeof(low) !== 'number' || typeof(high) !== 'number') {
      throw 'Invalid zlim: numeric type required.'
    }
    this.axes.zlim = [low, high];
    this.redraw();
  }

  //---------private-ish-----------//

  clear_canvas() {
    this.canvas.width = this.canvas.width;
  }

  redraw() {
    this.clear_canvas();
    if (this.axes.display) { this.draw_axes(); }
    this.drawings.forEach(drawing => {
      if (drawing.type === 'path') {
        this.draw_path(drawing.data);
      } else if (drawing.type === 'matrix') {
        this.matrix(drawing.data.x, drawing.data.y, drawing.data.z);
      }
    });
  }

  draw_axes () {
    this.draw_path([[this.axes.xlim[0], 0], [this.axes.xlim[1], 0]]);
    this.draw_path([[0, this.axes.ylim[0]], [0, this.axes.ylim[1]]]);
  }

  draw_path(path) {
    var pencil_down = false;
    path.forEach((xy, index) => {
      if (this.is_point_in_view(xy)) {
        if (pencil_down) {
          this.cursor.lineTo(this.x_to_px(xy[0]), this.y_to_px(xy[1]));
        } else {
          pencil_down = true;
          this.cursor.moveTo(this.x_to_px(xy[0]), this.y_to_px(xy[1]));
        }
      } else {
        if (pencil_down) { this.cursor.stroke(); }
        pencil_down = false
      }
    });
    if (pencil_down) { this.cursor.stroke(); }
  }

  draw_scatter_text(data, mark, color, size) {
    var fill
    if (typeof(color) === 'number') {
      fill = this.z_to_color(color);
    } else {
      fill = color;
    }
    data.forEach((xy, index) => {
      if (!this.is_point_in_view(xy)) { return; }
      this.cursor.font = '' + size + 'px Arial';
      this.cursor.fillStyle = fill;
      this.cursor.textAlign = 'center';
      this.cursor.fillText(mark, this.x_to_px(xy[0]), this.y_to_px(xy[1]));
    });
  }

  draw_scatter_symbol(data, mark, color, size) {
    var fill
    if (typeof(color) === 'number') {
      fill = this.z_to_color(color);
    } else {
      fill = color;
    }
    data.forEach((xy, index) => {
      if (!this.is_point_in_view(xy)) { return; }
      this.cursor.beginPath();
      this.cursor.strokeStyle = 'rgb(0,0,0)';
      this.cursor.fillStyle = fill;
      this.cursor.lineWidth = 2;
      this.cursor.arc(this.x_to_px(xy[0]), this.y_to_px(xy[1]), size, 0, 2*math.pi);
      this.cursor.stroke();
      this.cursor.fill();
    });
  }

  draw_matrix(x, y, z) {
    var dx = x.length <= 1 ? 1 : math.mean(x.slice(1, x.length)) - math.mean(x.slice(0, x.length - 1));
    var dy = y.length <= 1 ? 1 : math.mean(y.slice(1, y.length)) - math.mean(y.slice(0, y.length - 1));

    for (var jj = 0; jj < x.length; jj++) {
      var x0 = this.x_to_px(jj === 0 ? x[jj] - dx : (x[jj - 1] + x[jj]) / 2);
      var x1 = this.x_to_px(jj === x.length - 1 ? x[jj] + dx : (x[jj] + x[jj + 1]) / 2);
      var ww = x1 - x0;
      for (var ii = 0; ii < y.length; ii++) {
        var y0 = this.y_to_px(ii === 0 ? y[ii] - dy : (y[ii - 1] + y[ii]) / 2);
        var y1 = this.y_to_px(ii === y.length - 1 ? y[ii] + dy : (y[ii] + y[ii + 1]) / 2);
        var hh = y0 - y1;
        var color = this.z_to_color(z[ii][jj]);
        this.cursor.fillStyle = color;
        this.cursor.fillRect(x0, y1, ww, hh);
      }
    }
  }

  is_point_in_view(xy) {
    return (
      xy[0] >= this.axes.xlim[0] && xy[0] <= this.axes.xlim[1] &&
      xy[1] >= this.axes.ylim[0] && xy[1] <= this.axes.ylim[1]
    );
  }

  x_to_px(x) {
    return this.norm_coef(x, this.axes.xlim) * this.canvas.width;
  }

  px_to_x(px) {
    return this.scale_norm_coef(px / this.canvas.width, this.axes.xlim);
  }

  y_to_px(y) {
    return (1 - this.norm_coef(y, this.axes.ylim)) * this.canvas.height;
  }

  px_to_y(px) {
    return this.scale_norm_coef(1 - px / this.canvas.height, this.axes.ylim);
  }

  z_to_color(z) {
    return this.colormap.style(this.norm_coef(z, this.axes.zlim));
  }

  norm_coef(q, qlim) {
    return (q - qlim[0]) / (qlim[1] - qlim[0]);
  }

  scale_norm_coef(qs, qlim) {
    return qs * (qlim[1] - qlim[0]) + qlim[0];
  }

  validate_xy_data(data) {
    data.forEach((xy, idx) => {
      if (
        typeof(xy) !== 'object' ||
        xy.length !== 2
      ) { throw 'Invalid data: must be array of [x,y] pairs.' }
      if (typeof(xy[0]) !== 'number' || typeof(xy[1]) !== 'number') {
        throw 'Invalid data: numeric data pairs required (received ' + typeof(xy[0]) + ', ' + typeof(xy[1]) + ').'
      }
    })
  }

  validate_matrix(x, y, z) {
    if (typeof(x) !== 'object' || typeof(x.length) !== 'number') { throw 'Invalid x data for matrix: expected Array'; }
    if (typeof(y) !== 'object' || typeof(y.length) !== 'number') { throw 'Invalid y data for matrix: expected Array'; }
    if (typeof(z) !== 'object' || typeof(z.length) !== 'number') { throw 'Invalid z data for matrix: expected Array'; }
    if (z.length !== y.length) { throw 'Invalid data for matrix: z must have number of rows equal to length of y'}
    z.forEach((z0, idx) => {
      if (typeof(z0) !== 'object' || typeof(z0.length) !== 'number') { throw 'Invalid data for matrix: expected Array of Arrays'; }
      if (z0.length !== x.length) { throw 'Invalid data for matrix: length of rows in z must be equal to length of x'}
    });
  }
}

nnjs.NetworkPainter = function(div, network) {
  if (!div || div.tagName !== 'DIV') { throw 'NetworkPainter requires a div element'; }

  this.div = div;
  this.defs_svg = null;
  this.svg = null;
  this.neurons = [];
  this.axons = [];

  this.network = network;
  this.padding = 7;
  this.selected_layer = null;
  this.selected_index = null;

  this.initialize_html();
}

nnjs.NetworkPainter.prototype = {
  paint: function() {
    this.clear();
    if (this.selected_layer !== null && this.selected_index !== null) { this.paint_neuron_selector(); }

    for (var ll=0; ll<this.network.layers.length; ll++) {
      this.axons[ll] = [];
      this.neurons[ll] = [];
      for (var ii=0; ii<this.network.layers[ll].length; ii++) {
        this.neurons[ll][ii] = this.paint_neuron(ll, ii);
        this.axons[ll][ii] = [];
        if (ll > 0) {
          for (var jj=0; jj<this.network.layers[ll-1].length; jj++) {
            this.axons[ll][ii][jj] = this.paint_axon(ll, ii, jj);
          }
        }
      }
    }

    if (this.selected_layer !== null && this.selected_index !== null) { this.paint_layer_selecter(); }

  },

  update: function() {
    var painter = this;
    this.network.layers.forEach(function(neurons, layer) {
      neurons.forEach(function(neuron, index) {
        if (!painter.neurons[layer][index]) { return; }
        painter.update_neuron(painter.neurons[layer][index]);
        if (layer > 1) {
          painter.network.layers[layer - 1].forEach(function(from_neuron, from_index) {
            if (!painter.axons[layer][index][from_index]) { return; }
            painter.update_axon(painter.axons[layer][index][from_index]);
          });
        }
      });
    });
  },

  clear: function() {
    this.svg.innerHTML = "";
  },

  select_neuron: function(layer, index) {
    this.selected_layer = parseInt(layer, 10);
    this.selected_index = parseInt(index, 10);
    this.paint();
  },

  unselect_neuron: function() {
    this.selected_layer = null;
    this.selected_index = null;
    this.paint();
  },

  //----- private-ish -----//

  paint_neuron: function(layer, index) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'neuron');
    circle.setAttribute('data-layer', layer);
    circle.setAttribute('data-index', index);
    this.update_neuron(circle);

    this.svg.appendChild(circle);
    return circle;
  },

  update_neuron: function(neuron) {
    var layer = $(neuron).attr('data-layer');
    var index = $(neuron).attr('data-index');
    neuron.setAttribute('cx', this.neuron_x(layer, index));
    neuron.setAttribute('cy', this.neuron_y(layer, index));
    neuron.setAttribute('r', this.neuron_radius());
    neuron.setAttribute('fill', 'rgb(255,255,255)');
    neuron.setAttribute('stroke', this.coef_color(this.network.layers[layer][index].bias));
    neuron.setAttribute('stroke-width', 1);
  },

  paint_axon: function(layer, to_index, from_index) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    line.setAttribute('class', 'axon');
    line.setAttribute('data-layer', layer);
    line.setAttribute('data-from-index', from_index);
    line.setAttribute('data-to-index', to_index);
    this.update_axon(line);

    this.svg.appendChild(line);
    return line;
  },

  update_axon: function(axon) {
    var layer = $(axon).attr('data-layer');
    var from_index = $(axon).attr('data-from-index');
    var to_index = $(axon).attr('data-to-index');

    var r = this.neuron_radius();
    var nx0 = this.neuron_x(layer - 1, from_index);
    var ny0 = this.neuron_y(layer - 1, from_index);
    var nx1 = this.neuron_x(layer, to_index);
    var ny1 = this.neuron_y(layer, to_index);
    var d = math.sqrt((nx1-nx0)**2 + (ny1-ny0)**2);
    var a = (r + 5) / d;
    var x0 = nx0 + a * (nx1 - nx0);
    var y0 = ny0 + a * (ny1 - ny0);
    var x1 = nx1 - a * (nx1 - nx0);
    var y1 = ny1 - a * (ny1 - ny0);
    var weight = this.network.layers[layer][to_index].weights[from_index];

    axon.setAttribute('x1', x0);
    axon.setAttribute('y1', y0);
    axon.setAttribute('x2', x1);
    axon.setAttribute('y2', y1);
    axon.setAttribute('style', 'stroke:' + this.coef_color(weight) + ';stroke-width:1');
  },

  paint_neuron_selector: function() {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', this.neuron_x(this.selected_layer, this.selected_index));
    circle.setAttribute('cy', this.neuron_y(this.selected_layer, this.selected_index));
    circle.setAttribute('r', this.neuron_radius() + 20);
    circle.setAttribute('fill', 'url(#grad-neuron-select)');
    circle.setAttribute('stroke', 'none');
    this.svg.appendChild(circle);
  },

  paint_layer_selecter: function() {
    var top_triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    var x = this.neuron_x(this.selected_layer, this.selected_index);
    var y = 0;
    var points = '' + ((x-5) + ',' + y) + ' ' + ((x+5) + ',' + y) + ' ' + (x + ',' + (y+5))
    top_triangle.setAttribute('points', points)
    top_triangle.setAttribute('style', "fill: rgb(0,0,0)")
    this.svg.appendChild(top_triangle);

    var bottom_triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    var x = this.neuron_x(this.selected_layer, this.selected_index);
    var y = this.svg.getBoundingClientRect().height;
    var points = '' + ((x-5) + ',' + y) + ' ' + ((x+5) + ',' + y) + ' ' + (x + ',' + (y-5))
    bottom_triangle.setAttribute('points', points)
    bottom_triangle.setAttribute('style', "fill: rgb(0,0,0)")
    this.svg.appendChild(bottom_triangle);
  },

  neuron_radius: function() {
    var xrad = this.paintable_width() / (4 * this.network.layers.length + 1);
    var max_n = math.max(this.network.layers.map(function(ns) {return ns.length;}));
    var yrad = this.paintable_height() / (2 * max_n + 1);
    return math.min(xrad, yrad);
  },

  neuron_spacing: function() {
    return 4 * this.neuron_radius();
  },

  paintable_width: function() {
    return this.svg.getBoundingClientRect().width - 2 * this.padding;
  },

  paintable_height: function() {
    return this.svg.getBoundingClientRect().height - 2 * this.padding;
  },

  neuron_x: function(layer, index) {
    if (this.network.layers.length === 1) {
      return this.padding + this.paintable_width() / 2;
    } else {
      return this.padding + this.neuron_radius() + layer * (this.paintable_width() - 2 * this.neuron_radius()) / (this.network.layers.length - 1);
    }
  },

  neuron_y: function(layer, index) {
    if (this.network.layers[layer].length === 1) {
      return this.padding + this.paintable_height() / 2;
    } else {
      return this.padding + this.neuron_radius() + index * (this.paintable_height() - 2 * this.neuron_radius()) / (this.network.layers[layer].length - 1);
    }
  },

  coef_color: function(coef) {
    if (coef > 0) {
      var red = this.color_partial(coef, 220, 220);
      var green = this.color_partial(coef, 200, 100);
      var blue = this.color_partial(coef, 200, 100);
    } else {
      var red = this.color_partial(coef, 220, 100);
      var green = this.color_partial(coef, 200, 200);
      var blue = this.color_partial(coef, 200, 100);
    }
    return 'rgb(' + red + ',' + green + ',' + blue + ')';
  },

  color_partial: function(x, min, max) {
    if (min === undefined) { min = 0; }
    if (max === undefined) { max = 255; }
    var dir = x > 0 ? 1 : -1
    return math.round(min + (max - min) * (2 * nnjs.functions.sigmoid(dir * 5*x) - 1));
  },

  initialize_html: function() {
    this.defs_svg = document.createElementNS('http://www.w3.org/2000/svg',"svg");
    $(this.defs_svg).css('width', '0px');
    $(this.defs_svg).css('height', '0px');
    $(this.defs_svg).css('position', 'relative');
    this.div.appendChild(this.defs_svg);

    this.svg = document.createElementNS('http://www.w3.org/2000/svg',"svg");
    this.div.appendChild(this.svg);
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.defs_svg.appendChild(this.defs);

    this.define_neuron_selection_gradient();
  },

  define_neuron_selection_gradient: function() {
    var gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', 'grad-neuron-select');

    var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgb(200,200,255)');
    var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '70%');
    stop2.setAttribute('stop-color', 'rgb(200,200,255)');
    var stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', 'rgb(255,255,255)');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    this.defs.appendChild(gradient);
  },
}

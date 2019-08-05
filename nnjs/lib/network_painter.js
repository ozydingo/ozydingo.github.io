import { sigmoid } from './nnjs_functions.js'

// Draws a representation of the nnjs.Network using <svg> elements.
export class NetworkPainter {
  constructor(div, network) {
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

  // Draw all elements from scratch.
  paint() {
    this.clear();
    if (this.selected_layer !== null && this.selected_index !== null) { this.paint_neuron_selector(); }

    for (let ll=0; ll<this.network.layers.length; ll++) {
      this.axons[ll] = [];
      this.neurons[ll] = [];
      for (let ii=0; ii<this.network.layers[ll].length; ii++) {
        this.neurons[ll][ii] = this.paint_neuron(ll, ii);
        this.axons[ll][ii] = [];
        if (ll > 0) {
          for (let jj=0; jj<this.network.layers[ll-1].length; jj++) {
            this.axons[ll][ii][jj] = this.paint_axon(ll, ii, jj);
          }
        }
      }
    }

    if (this.selected_layer !== null && this.selected_index !== null) { this.paint_layer_selecter(); }

  }

  // Update neuron & axon colors / styles without redrawing the entire svg.
  update() {
    this.network.layers.forEach((neurons, layer) => {
      neurons.forEach((neuron, index) => {
        if (!this.neurons[layer][index]) { return; }
        this.update_neuron(this.neurons[layer][index]);
        if (layer > 1) {
          this.network.layers[layer - 1].forEach((from_neuron, from_index) => {
            if (!this.axons[layer][index][from_index]) { return; }
            this.update_axon(this.axons[layer][index][from_index]);
          });
        }
      });
    });
  }

  clear() {
    this.svg.innerHTML = "";
  }

  // Set the given neuron as "selected"
  select_neuron(layer, index) {
    this.selected_layer = parseInt(layer, 10);
    this.selected_index = parseInt(index, 10);
    this.paint();
  }

  // Unset any selected neurons.
  unselect_neuron() {
    this.selected_layer = null;
    this.selected_index = null;
    this.paint();
  }

  //----- private-ish -----//

  // Draw a neuron.
  paint_neuron(layer, index) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'neuron');
    circle.setAttribute('data-layer', layer);
    circle.setAttribute('data-index', index);
    this.update_neuron(circle);

    this.svg.appendChild(circle);
    return circle;
  }

  // Update the color/style or a given neuron.
  update_neuron(neuron) {
    const layer = $(neuron).attr('data-layer');
    const index = $(neuron).attr('data-index');
    neuron.setAttribute('cx', this.neuron_x(layer, index));
    neuron.setAttribute('cy', this.neuron_y(layer, index));
    neuron.setAttribute('r', this.neuron_radius());
    neuron.setAttribute('fill', 'rgb(255,255,255)');
    neuron.setAttribute('stroke', this.coef_color(this.network.layers[layer][index].bias));
    neuron.setAttribute('stroke-width', 2);
  }

  // Draw an axon between two neurons.
  paint_axon(layer, to_index, from_index) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    line.setAttribute('class', 'axon');
    line.setAttribute('data-layer', layer);
    line.setAttribute('data-from-index', from_index);
    line.setAttribute('data-to-index', to_index);
    this.update_axon(line);

    this.svg.appendChild(line);
    return line;
  }

  // Update the color / style of the given axon.
  update_axon(axon) {
    const layer = $(axon).attr('data-layer');
    const from_index = $(axon).attr('data-from-index');
    const to_index = $(axon).attr('data-to-index');

    const r = this.neuron_radius();
    const nx0 = this.neuron_x(layer - 1, from_index);
    const ny0 = this.neuron_y(layer - 1, from_index);
    const nx1 = this.neuron_x(layer, to_index);
    const ny1 = this.neuron_y(layer, to_index);
    const d = math.sqrt((nx1-nx0)**2 + (ny1-ny0)**2);
    const a = (r + 5) / d;
    const x0 = nx0 + a * (nx1 - nx0);
    const y0 = ny0 + a * (ny1 - ny0);
    const x1 = nx1 - a * (nx1 - nx0);
    const y1 = ny1 - a * (ny1 - ny0);
    const weight = this.network.layers[layer][to_index].weights[from_index];

    axon.setAttribute('x1', x0);
    axon.setAttribute('y1', y0);
    axon.setAttribute('x2', x1);
    axon.setAttribute('y2', y1);
    axon.setAttribute('style', 'stroke:' + this.coef_color(weight) + ';stroke-width:2');
  }

  // Draw a halo around the selected neuron.
  paint_neuron_selector() {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', this.neuron_x(this.selected_layer, this.selected_index));
    circle.setAttribute('cy', this.neuron_y(this.selected_layer, this.selected_index));
    circle.setAttribute('r', this.neuron_radius() + 20);
    circle.setAttribute('fill', 'url(#grad-neuron-select)');
    circle.setAttribute('stroke', 'none');
    this.svg.appendChild(circle);
  }

  // Draw triangles at the selected layer
  paint_layer_selecter() {
    const top_triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const x_top = this.neuron_x(this.selected_layer, this.selected_index);
    const y_top = 0;
    const points_top = '' + ((x_top-5) + ',' + y_top) + ' ' + ((x_top+5) + ',' + y_top) + ' ' + (x_top + ',' + (y_top+5))
    top_triangle.setAttribute('points', points_top)
    top_triangle.setAttribute('style', "fill: rgb(0,0,0)")
    this.svg.appendChild(top_triangle);

    const bottom_triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const x_bottom = this.neuron_x(this.selected_layer, this.selected_index);
    const y_bottom = this.svg.getBoundingClientRect().height;
    const points_bottom = '' + ((x_bottom-5) + ',' + y_bottom) + ' ' + ((x_bottom+5) + ',' + y_bottom) + ' ' + (x_bottom + ',' + (y_bottom-5))
    bottom_triangle.setAttribute('points', points_bottom)
    bottom_triangle.setAttribute('style', "fill: rgb(0,0,0)")
    this.svg.appendChild(bottom_triangle);
  }

  // Compute radius of neuron; account for #layers and #neurons in largest layer.
  neuron_radius() {
    const xrad = this.paintable_width() / (4 * this.network.layers.length + 1);
    const max_n = math.max(this.network.layers.map(ns => ns.length));
    const yrad = this.paintable_height() / (2 * max_n + 1);
    return math.min(xrad, yrad);
  }

  // Compute space between neurons. Unused?
  neuron_spacing() {
    return 4 * this.neuron_radius();
  }

  // Available width inside padding for neuron painting.
  paintable_width() {
    return this.svg.getBoundingClientRect().width - 2 * this.padding;
  }

  // Available height inside padding for neuron painting.
  paintable_height() {
    return this.svg.getBoundingClientRect().height - 2 * this.padding;
  }

  // Compute center point of neuron on x axis
  neuron_x(layer, index) {
    if (this.network.layers.length === 1) {
      return this.padding + this.paintable_width() / 2;
    } else {
      return this.padding + this.neuron_radius() + layer * (this.paintable_width() - 2 * this.neuron_radius()) / (this.network.layers.length - 1);
    }
  }

  // Compute center point of neuron on y axis.
  neuron_y(layer, index) {
    if (this.network.layers[layer].length === 1) {
      return this.padding + this.paintable_height() / 2;
    } else {
      return this.padding + this.neuron_radius() + index * (this.paintable_height() - 2 * this.neuron_radius()) / (this.network.layers[layer].length - 1);
    }
  }

  // Compute a color to represent a value. Use signoid-compression to scale.
  coef_color(coef) {
    let red, green, blue;
    if (coef > 0) {
      red = this.color_partial(coef, 220, 220);
      green = this.color_partial(coef, 200, 100);
      blue = this.color_partial(coef, 200, 100);
    } else {
      red = this.color_partial(coef, 220, 100);
      green = this.color_partial(coef, 200, 200);
      blue = this.color_partial(coef, 200, 100);
    }
    return 'rgb(' + red + ',' + green + ',' + blue + ')';
  }

  // Transform a normalized (0,1) value to the corresponding r, g, or b value.
  color_partial(x, min, max) {
    if (min === undefined) { min = 0; }
    if (max === undefined) { max = 255; }
    const dir = x > 0 ? 1 : -1
    return math.round(min + (max - min) * (2 * sigmoid(dir * 5*x) - 1));
  }

  // Create the <svg> and <defs> elements
  initialize_html() {
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
  }

  // Use a <radialGradient> element to define the selected neuron indicator
  define_neuron_selection_gradient() {
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', 'grad-neuron-select');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgb(200,200,255)');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '70%');
    stop2.setAttribute('stop-color', 'rgb(200,200,255)');
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', 'rgb(255,255,255)');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    this.defs.appendChild(gradient);
  }
}

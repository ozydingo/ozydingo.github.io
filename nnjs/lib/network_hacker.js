nnjs.NetworkHacker = function(network) {
  this.network = network;
}

nnjs.NetworkHacker.prototype = {
  // Add a hidden layer immediately before the output layer
  add_layer: function(num_neurons) {
    if (num_neurons === undefined) { throw "Must provide number of neurons in new layer" }
    var ll = this.network.layers.length - 1;
    var num_outputs = this.network.layers[ll].length;
    var new_layer = this.network.build_layer(num_neurons, this.network.layers[ll-1]);
    var next_layer = this.network.build_layer(num_outputs, new_layer);
    this.network.layers.splice(ll, 1, new_layer, next_layer);
    this.network.num_neurons.splice(ll, 1, num_neurons, num_outputs);
  },

  // Remove the hidden layer immediately before the output layer
  remove_layer: function() {
    var ll = this.network.layers.length - 1;
    var num_outputs = this.network.layers[ll].length;
    var next_layer = this.network.build_layer(num_outputs, this.network.layers[ll-2]);
    this.network.layers.splice(ll - 1, 2, next_layer);
    this.network.num_neurons.splice(ll - 1, 2, next_layer);
  },

  // Add a neuron to the specified layer
  add_neuron: function(layer) {
    if (layer <= 0) {
      throw "Not supported: adding neuron to input layer";
    } else if (layer >= this.network.layers.length - 1) {
      throw "Not supported: adding neuron to output layer";
    }

    var num_neurons = this.network.layers[layer].length;
    var num_outputs = this.network.layers[layer + 1].length;
    var modified_layer = this.network.build_layer(num_neurons + 1, this.network.layers[layer - 1]);
    var next_layer = this.network.build_layer(num_outputs, modified_layer);
    this.network.layers.splice(layer, 2, modified_layer, next_layer);
    this.network.num_neurons.splice(layer, 2, modified_layer, next_layer);
  },

  // Remove the last neuron in the specified layer
  remove_neuron: function(layer) {
    if (layer <= 0) {
      throw "Not supported: removing neuron from input layer";
    } else if (layer >= this.network.layers.length - 1) {
      throw "Not supported: removing neuron from output layer";
    }

    var num_neurons = this.network.layers[layer].length;
    if (num_neurons <= 1) {
      throw "Not supported: removing last neuron in layer. Use remove_layer() instead.";
    }
    var num_outputs = this.network.layers[layer + 1].length;
    var modified_layer = this.network.build_layer(num_neurons - 1, this.network.layers[layer - 1]);
    var next_layer = this.network.build_layer(num_outputs, modified_layer);
    this.network.layers.splice(layer, 2, modified_layer, next_layer);
    this.network.num_neurons.splice(layer, 2, modified_layer, next_layer);
  },
}

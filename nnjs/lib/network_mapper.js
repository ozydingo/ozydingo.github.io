nnjs.NetworkMapper = function(network, which_inputs) {
  this.network = network;
  this.dims = which_inputs || [0, 1];
  this.ndim = this.dims.length;
  this.lims = new Array(this.ndim);
  this.steps = new Array(this.ndim);
  this.input_space = null;

  for (var ii=0; ii<this.ndim; ii++) {
    this.lims[ii] = [-1, 1];
    this.steps[ii] = 0.05;
  }
  this.input_space = this.compute_input_space();
}

nnjs.NetworkMapper.prototype = {
  compute: function(inputs, which_output) {
    if (inputs === undefined) {
      var inputs = new Array(this.network.num_neurons[0]);
      for (var ii=0; ii < this.dims.length; ii++){
        inputs[this.dims[ii]] = 0;
      }
    }

    if (typeof(inputs) !== 'object' || inputs.length !== this.network.num_neurons[0]) {
      throw("Bad inputs: expected array of length " + this.network.num_neurons[0]);
    }

    return this.map_one(inputs, this.ndim - 1, which_output);
  },

  //-------private-ish---------//

  map_one: function(inputs, index, which_output) {
    var [output_layer, output_index] = this.parse_output(which_output);

    var mapper = this;
    // For this input index, loop through input space and compute outputs
    var outputs = this.input_space[index].map(function(x, jj) {
      // this is in-place modification of inputs, but that's ok.
      inputs[index] = mapper.input_space[index][jj];
      // Recursion:
      if (index == 0) {
        // Stop condition: reached the "bottom" input
        var result = mapper.network.forward(inputs);
        return result.activations[output_layer][output_index];
      } else {
        // Recurse: for the current value of input[index], compute "nested" outputs
        return mapper.map_one(inputs, index - 1, which_output);
      }
    });
    return outputs;
  },

  compute_input_space: function() {
    var space = new Array(this.ndim);
    for (var ii=0; ii<this.ndim; ii++) {
      space[ii] = new Array;
      for (var jj = this.lims[ii][0]; jj <= this.lims[ii][1]; jj += this.steps[ii]) {
        space[ii][space[ii].length] = jj
      }
    }
    return space;
  },

  parse_output(which_output) {
    if (which_output === undefined) {
      return [this.network.layers.length - 1, 0];
    }

    if (typeof(which_output) !== 'object' || which_output.length !== 2) {
      throw "Invalid output: require [layer, index]";
    }

    var [layer, index] = which_output;

    if (layer <= 0 || layer > this.network.layers.length - 1) {
      throw "Invalid output: Must be a hidden or output layer";
    } else if (index < 0 || index > this.network.layers[layer].length) {
      throw "Invalid output: neuron index out of bounds";
    }

    return [layer, index];
  },


}

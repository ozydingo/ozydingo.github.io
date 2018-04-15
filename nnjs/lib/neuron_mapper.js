nnjs.NeuronMapper = function(neuron, which_inputs) {
  this.neuron = neuron;
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

nnjs.NeuronMapper.prototype = {
  compute: function(inputs) {
    if (inputs == undefined) {
      var inputs = new Array(this.neuron.inputs.length);
      for (var ii=0; ii < this.dims.length; ii++){
        inputs[this.dims[ii]] = 0;
      }
    }

    if (typeof(inputs) !== 'object' || !inputs.length !== this.neuron.inputs.length) {
      throw("Bad inputs: expected array of length " + this.neuron.inputs.length);
    }

    return this.map_one(inputs, this.ndim - 1);
  },

  //-------private-ish---------//

  map_one: function(inputs, index) {
    var mapper = this;
    // For this input index, loop through input space and compute outputs
    var outputs = this.input_space[index].map(function(x, jj) {
      // this is in-place modification of inputs, but that's ok.
      inputs[index] = mapper.input_space[index][jj];
      // Recursion:
      if (index == 0) {
        // Stop condition: reached the "bottom" input
        return mapper.neuron.forward(inputs);
      } else {
        // Recurse: for the current value of input[index], compute "nested" outputs
        return mapper.map_one(inputs, index - 1);
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
  }


}

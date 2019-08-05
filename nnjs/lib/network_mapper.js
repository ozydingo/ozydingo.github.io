// Computes the outputs of a network, or a neuron in the network, for a range of
// input values.
// TODO: ALlow custom input spaces to be requested.
export class NetworkMapper {
    constructor(network, which_inputs) {
    this.network = network;
    this.dims = which_inputs || [0, 1];
    this.ndim = this.dims.length;
    this.lims = new Array(this.ndim);
    this.steps = new Array(this.ndim);
    this.input_space = null;

    for (let ii=0; ii<this.ndim; ii++) {
      this.lims[ii] = [-1, 1];
      this.steps[ii] = 0.05;
    }
    this.input_space = this.compute_input_space();
  }

  // inputs - which neurons to vary the inputs of. Currently only supports 2.
  // which_output - Which neuron's output to compute. Default is first neuron
  // in output layer.
  compute(inputs, which_output) {
    if (inputs === undefined) {
      inputs = new Array(this.network.num_neurons[0]);
      for (let ii=0; ii < this.dims.length; ii++){
        inputs[this.dims[ii]] = 0;
      }
    }

    if (typeof(inputs) !== 'object' || inputs.length !== this.network.num_neurons[0]) {
      throw("Bad inputs: expected array of length " + this.network.num_neurons[0]);
    }

    return this.map_one(inputs, this.ndim - 1, which_output);
  }

  //-------private-ish---------//

  // Loop through the range of input values at the specified neuron and compute
  // the output values at the specified output neuron.
  // Recursive strategy: for each input variance, recursively call map_one for
  // all of its upstream neurons so the final output contains all input variances
  // visible to the specified neuron within the defined input ranges.
  map_one(inputs, index, which_output) {
    const [output_layer, output_index] = this.parse_output(which_output);

    // For this input index, loop through input space and compute outputs
    const outputs = this.input_space[index].map((x, jj) => {
      // this is in-place modification of inputs, but that's ok.
      inputs[index] = this.input_space[index][jj];
      // Recursion:
      if (index == 0) {
        // Stop condition: reached the "bottom" input
        const result = this.network.forward(inputs);
        return result.activations[output_layer][output_index];
      } else {
        // Recurse: for the current value of input[index], compute "nested" outputs
        return this.map_one(inputs, index - 1, which_output);
      }
    });
    return outputs;
  }

  // Compute vector of values to use in compute loop.
  compute_input_space() {
    let space = new Array(this.ndim);
    for (let ii=0; ii<this.ndim; ii++) {
      space[ii] = new Array;
      for (let jj = this.lims[ii][0]; jj <= this.lims[ii][1]; jj += this.steps[ii]) {
        space[ii][space[ii].length] = jj
      }
    }
    return space;
  }

  // Validate the which_output value and return as a multi-assignable array.
  parse_output(which_output) {
    if (which_output === undefined) {
      return [this.network.layers.length - 1, 0];
    }

    if (typeof(which_output) !== 'object' || which_output.length !== 2) {
      throw "Invalid output: require [layer, index]";
    }

    const [layer, index] = which_output;

    if (layer <= 0 || layer > this.network.layers.length - 1) {
      throw "Invalid output: Must be a hidden or output layer";
    } else if (index < 0 || index > this.network.layers[layer].length) {
      throw "Invalid output: neuron index out of bounds";
    }

    return [layer, index];
  }
}

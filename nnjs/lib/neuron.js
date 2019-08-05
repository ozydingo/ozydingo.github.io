import * as nn_functions from './nnjs_functions.js'

export class Neuron {
  constructor(num_inputs) {
    if (num_inputs == null) { throw "You must provide a number of inputs for your neuron.";}
    this.num_inputs = num_inputs;
    this.weights = math.random([num_inputs], -1, 1);;
    this.bias = math.random(-1, 1);
    this.activation_fn = nn_functions.soft_relu;
    this.activation_grad = nn_functions.soft_relu_prime;
    this.eta = 0.2;
  }

  // Compute output of neuron given inputs
  forward(inputs) {
    return this.activation_fn(this.weighted_input(inputs));
  }

  // Respond to output error, adjust params according to gradient
  backward(inputs, output_error) {
    const input_errors = math.multiply(output_error * this.weights, this.activation_grad(this.weighted_input(inputs)));
    const [weights_gradient, bias_gradient] = this.param_gradient(inputs, output_error);
    this.bias = this.bias - this.eta * bias_gradient;
    this.weights = math.subtract(this.weights, math.multiply(this.eta, weights_gradient));
    return input_errors;
  }

  // linear combination of inputs -> input to activation function
  weighted_input(inputs) {
    return math.multiply(this.weights, inputs) + this.bias;
  }

  // compute gradient of neuron params given inputs & output error
  param_gradient(inputs, output_error) {
    const del = this.weighted_input(inputs) * output_error;
    const bias_gradient = del;
    const weights_gradient = inputs * del;
    return [weights_gradient, bias_gradient];
  }
}

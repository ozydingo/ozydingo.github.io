import { Neuron } from './neuron.js'
import * as nn_functions from './nnjs_functions.js'

// num_neurons is an array of integers, length == number of layers
// Each integer represents the number of neurons in that layer.
export class NeuralNetwork {
  constructor(num_neurons) {
    if (typeof(num_neurons) !== 'object' || num_neurons.length === undefined) {
      throw 'num_neurons must be an array of num neurons per layer.'
    }
    this.num_neurons = num_neurons;
    this.layers = [];
    for (let ll=0; ll < num_neurons.length; ll++) {
      if (ll === 0) {
        this.layers[ll] = this.build_input_layer(num_neurons[ll]);
      } else {
        this.layers[ll] = this.build_layer(num_neurons[ll], this.layers[ll-1]);
      }
    }
    this.layers[num_neurons.length-1].forEach(neuron => {
      neuron.activation_fn = nn_functions.sigmoid;
      neuron.activation_grad = nn_functions.sigmoid_prime;
    })
    this.eta = 0.1;
  }

  // Compute activations and weighted inputs (z) of all neurons in the network.
  forward(inputs) {
    if (typeof(inputs) !== 'object') {
      throw 'Invalid inputs: expected numbers.'
    } else if (inputs.length !== this.layers[0].length) {
      throw '' + this.layers[0].length + ' inputs expected, ' + inputs.length + ' given.'
    }

    let z = this.nulls()
    let activations = this.nulls();
    z[0] = inputs.slice();
    activations[0] = inputs.slice();
    for (let layer = 1; layer < this.layers.length; layer++) {
      z[layer] = math.multiply(this.layer_weights(layer), activations[layer - 1])
      z[layer] = math.add(z[layer], this.layer_biases(layer));
      if (typeof(z[layer]) === 'number') {
        z[layer] = [z[layer]];
      } else {
        z[layer] = z[layer]._data;
      }
      activations[layer] = z[layer].map((z, ii) => {
        return this.layers[layer][ii].activation_fn(z);
      });
    }
    return { z, activations };
  }

  backward(activations, z, desired_outputs) {
    if (typeof(desired_outputs) !== 'object') {
      throw 'Invalid desired_outputs: expected numbers.'
    } else if (desired_outputs.length !== this.layers[this.layers.length - 1].length) {
      throw '' + this.layers[this.layers.length - 1].length + ' output errors expected, ' + desired_outputs.length + ' given.'
    }

    const activation_grads = this.compute_activation_gradients(z);
    const layer_error = this.compute_layer_errors(activations, activation_grads, desired_outputs);
    const gradients = this.compute_gradients(activations, layer_error);

    return gradients;
  }

  // Return just the output activations of the network for given inputs.
  output(inputs) {
    const result = this.forward(inputs);
    return result.activations[this.layers.length - 1];
  }

  // Run one forward-backward pass and update the network params
  train(inputs, desired_outputs) {
    const { z, activations } = this.forward(inputs);
    const gradients = this.backward(activations, z, desired_outputs)

    // Apply deltas
    for (let layer = 1; layer < this.layers.length; layer++) {
      for (let ii = 0; ii < this.layers[layer].length; ii++) {
        this.layers[layer][ii].bias = this.layers[layer][ii].bias - gradients["bias"][layer][ii] * this.eta;
        for (let jj = 0; jj < this.layers[layer-1].length; jj++) {
          this.layers[layer][ii].weights[jj] = this.layers[layer][ii].weights[jj] - gradients["weights"][layer]._data[ii][jj] * this.eta;
        }
      }
    }
  }

  // inputs is an array of input arrays
  // outputs is an array of output arrays
  train_batch(inputs, outputs) {
    const forward = inputs.map(input_vector => this.forward(input_vector));
    const gradients = forward.map(({ z, activations }, i) => this.backward(activations, z, outputs[i]))
    const bias_grads = gradients.map(g => g["bias"])
    const weights_grads = gradients.map(g => g["weights"])
    const mean_bias_grads = math.divide(
      bias_grads.reduce((memo, item) => math.add(memo, item)),
      gradients.length
    )
    const mean_weights_grads = math.divide(
      weights_grads.reduce((memo, item) => math.add(memo, item)),
      gradients.length
    )

    // Apply deltas
    for (let layer = 1; layer < this.layers.length; layer++) {
      for (let ii = 0; ii < this.layers[layer].length; ii++) {
        this.layers[layer][ii].bias = this.layers[layer][ii].bias - mean_bias_grads[layer][ii] * this.eta;
        for (let jj = 0; jj < this.layers[layer-1].length; jj++) {
          this.layers[layer][ii].weights[jj] = this.layers[layer][ii].weights[jj] - mean_weights_grads[layer]._data[ii][jj] * this.eta;
        }
      }
    }
  }

  // Get the activation gradients in the network given the weighted inputs (z).
  compute_activation_gradients(weighted_inputs) {
    let grads = this.nulls();
    for (let layer=1; layer < this.layers.length; layer++) {
      grads[layer] = weighted_inputs[layer].map((z, ii) => {
        return this.layers[layer][ii].activation_grad(z);
      });
    }
    return grads;
  }

  // Compute the error at each layer, needed for the backprop algorithm.
  compute_layer_errors(activations, activation_grads, desired_outputs) {
    let layer_error = this.nulls();

    layer_error[this.layers.length - 1] = math.dotMultiply(
      math.subtract(
        activations[this.layers.length - 1], desired_outputs
      ),
      activation_grads[this.layers.length - 1]
    );

    for (let layer = this.layers.length - 2; layer > 0; layer--) {
      layer_error[layer] = math.dotMultiply(
        math.multiply(
          math.transpose(this.layer_weights(layer + 1)),
          layer_error[layer + 1]
        ),
        activation_grads[layer],
      )._data;
    }

    return layer_error;
  }

  // Compute the gradients on each param to be applied in backprop
  compute_gradients(activations, layer_error) {
    let d_bias = this.nulls();
    let d_weights = this.nulls();

    for (let layer = 1; layer < this.layers.length; layer++) {
      d_bias[layer] = layer_error[layer].slice();
      d_weights[layer] = math.multiply(
        math.transpose(math.matrix([layer_error[layer]])),
        math.matrix([ activations[layer - 1] ])
      );
    }

    return {bias: d_bias, weights: d_weights};
  }

  // ----- private-ish ------ //

  build_input_layer(num_neurons) {
    let layer = new Array(num_neurons);
    for (let ii=0; ii<num_neurons; ii++) {
      layer[ii] = new Neuron(0);
      layer[ii].activation_fn = (x) => x;
      layer[ii].activation_grad = (x) => 1;
      layer[ii].bias = 0;
      layer[ii].weights = [1];
    }
    return layer;
  }

  build_layer(num_neurons, input_layer) {
    let layer = new Array(num_neurons);
    const num_inputs = input_layer.length;
    for (let ii=0; ii<num_neurons; ii++) {
      layer[ii] = new Neuron(num_inputs);
    }
    return layer;
  }

  layer_weights(layer) {
    return math.matrix(
      this.layers[layer].map(neuron => neuron.weights)
    );
  }

  layer_biases(layer) {
    return math.matrix(
      this.layers[layer].map(neuron => neuron.bias)
    )
  }

  // Allocate an array of nulls, one for each neuron.
  nulls() {
    return this.layers.map(neurons => neurons.map(neuron => null));
  }
}

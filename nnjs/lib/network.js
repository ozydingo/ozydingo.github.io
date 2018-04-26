// num_neurons is an array of integers, length == number of layers
// Each integer represents the number of neurons in that layer.
nnjs.Network = function(num_neurons) {
  if (typeof(num_neurons) !== 'object' || num_neurons.length === undefined) {
    throw 'num_neurons must be an array of num neurons per layer.'
  }
  this.num_neurons = num_neurons;
  this.layers = [];
  for (var ll=0; ll < num_neurons.length; ll++) {
    if (ll === 0) {
      this.layers[ll] = this.build_input_layer(num_neurons[ll]);
    } else {
      this.layers[ll] = this.build_layer(num_neurons[ll], this.layers[ll-1]);
    }
  }
  this.eta = 0.1;
}

nnjs.Network.prototype = {
  // Compute activations and weighted inputs (z) of all neurons in the network.
  forward: function(inputs) {
    if (typeof(inputs) !== 'object') {
      throw 'Invalid inputs: expected numbers.'
    } else if (inputs.length !== this.layers[0].length) {
      throw '' + this.layers[0].length + ' inputs expected, ' + inputs.length + ' given.'
    }

    var network = this;

    var z = this.nulls()
    var activations = this.nulls();
    z[0] = inputs.slice();
    activations[0] = inputs.slice();
    for (var layer = 1; layer < this.layers.length; layer++) {
      z[layer] = math.multiply(this.layer_weights(layer), activations[layer - 1])
      if (typeof(z[layer]) === 'number') {
        z[layer] = [z[layer]];
      } else {
        z[layer] = z[layer]._data;
      }
      activations[layer] = z[layer].map(function(z, ii) {
        return network.layers[layer][ii].activation_fn(z);
      });
    }
    return {z: z, activations: activations};
  },

  // Return just the output activations of the network for given inputs.
  output: function(inputs) {
    var result = this.forward(inputs);
    return result.activations[this.layers.length - 1];
  },

  // Run one forward-backward pass and update the network params
  train: function(inputs, desired_outputs) {
    if (typeof(inputs) !== 'object') {
      throw 'Invalid inputs: expected numbers.'
    } else if (inputs.length !== this.layers[0].length) {
      throw '' + this.layers[0].length + ' output errors expected, ' + inputs.length + ' given.'
    }
    if (typeof(desired_outputs) !== 'object') {
      throw 'Invalid desired_outputs: expected numbers.'
    } else if (desired_outputs.length !== this.layers[this.layers.length - 1].length) {
      throw '' + this.layers[this.layers.length - 1].length + ' output errors expected, ' + desired_outputs.length + ' given.'
    }

    var network = this;

    var forward_values = network.forward(inputs);
    var z = forward_values["z"];
    var activations = forward_values["activations"];
    var activation_grads = network.compute_activation_gradients(z);
    var layer_error = network.compute_layer_errors(activations, activation_grads, desired_outputs);
    var gradients = network.compute_gradients(activations, layer_error);

    // Apply deltas
    for (var layer = 1; layer < network.layers.length; layer++) {
      for (var ii = 0; ii < network.layers[layer].length; ii++) {
        network.layers[layer][ii].bias = network.layers[layer][ii].bias - gradients["bias"][layer][ii] * network.eta;
        for (var jj = 0; jj < network.layers[layer-1].length; jj++) {
          network.layers[layer][ii].weights[jj] = network.layers[layer][ii].weights[jj] - gradients["weights"][layer]._data[ii][jj] * network.eta;
        }
      }
    }
  },

  // Get the activation gradients in the network given the weighted inputs (z).
  compute_activation_gradients: function(weighted_inputs) {
    var network = this;
    var grads = this.nulls();
    for (var layer=1; layer < this.layers.length; layer++) {
      grads[layer] = weighted_inputs[layer].map(function(z, ii) {
        return network.layers[layer][ii].activation_grad(z);
      });
    }
    return grads;
  },

  // Compute the error at each layer, needed for the backprop algorithm.
  compute_layer_errors: function(activations, activation_grads, desired_outputs) {
    var network = this;
    var layer_error = this.nulls();

    layer_error[this.layers.length - 1] = math.dotMultiply(
      math.subtract(
        activations[this.layers.length - 1], desired_outputs
      ),
      activation_grads[network.layers.length - 1]
    );

    for (var layer = this.layers.length - 2; layer > 0; layer--) {
      layer_error[layer] = math.dotMultiply(
        math.multiply(
          math.transpose(this.layer_weights(layer + 1)),
          layer_error[layer + 1]
        ),
        activation_grads[layer],
      )._data;
    }

    return layer_error;
  },

  // Compute the gradients on each param to be applied in backprop
  compute_gradients: function(activations, layer_error) {
    var d_bias = this.nulls();
    var d_weights = this.nulls();

    for (var layer = 1; layer < this.layers.length; layer++) {
      d_bias[layer] = layer_error[layer].slice();
      d_weights[layer] = math.multiply(
        math.transpose(math.matrix([layer_error[layer]])),
        math.matrix([ activations[layer - 1] ])
      );
    }

    return {bias: d_bias, weights: d_weights};
  },

  // ----- private-ish ------ //

  build_input_layer: function(num_neurons) {
    var layer = new Array(num_neurons);
    for (var ii=0; ii<num_neurons; ii++) {
      layer[ii] = new nnjs.Neuron(0);
      layer[ii].activation_fn = function(x) { return x; };
      layer[ii].activation_grad = function(x) { return 1; };
      layer[ii].bias = 0;
      layer[ii].weights = [1];
    }
    return layer;
  },

  build_layer: function(num_neurons, input_layer) {
    var layer = new Array(num_neurons);
    var num_inputs = input_layer.length;
    for (var ii=0; ii<num_neurons; ii++) {
      layer[ii] = new nnjs.Neuron(num_inputs);
    }
    return layer;
  },

  layer_weights: function(layer) {
    return math.matrix(
      this.layers[layer].map(function(neuron) {
        return neuron.weights;
      })
    );
  },

  // Allocate an array of nulls, one for each neuron.
  nulls: function() {
    return this.layers.map(function(neurons) {
      return neurons.map(function(neuron) {
        return null;
      })
    });
  }
}

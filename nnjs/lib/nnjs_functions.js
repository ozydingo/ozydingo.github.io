nnjs.functions = {
  sigmoid: function(x) {
    return 1 / (1 + Math.exp(-x));
  },

  sigmoid_prime: function(x) {
    return nnjs.functions.sigmoid(x) * (1 - nnjs.functions.sigmoid(x));
  },
};

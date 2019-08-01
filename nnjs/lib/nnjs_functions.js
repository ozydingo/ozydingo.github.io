export const sigmoid = function(x) {
  return 1 / (1 + Math.exp(-x));
}

export const sigmoid_prime = function(x) {
  return sigmoid(x) * (1 - sigmoid(x));
}

export const relu = function(x) {
  if (x < 0) {
    return 0;
  } else {
    return x;
  }
}

export const relu_prime = function(x) {
  if (x < 0) {
    return 0;
  } else {
    return 1;
  }
}

export const soft_relu = function(x) {
  return Math.log(1 + Math.exp(x));
}

export const soft_relu_prime = function(x) {
  return 1 / (1 + Math.exp(x)) * Math.exp(x);
}

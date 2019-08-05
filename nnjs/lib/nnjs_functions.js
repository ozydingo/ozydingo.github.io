export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function sigmoid_prime(x) {
  return sigmoid(x) * (1 - sigmoid(x));
}

export function relu(x) {
  if (x < 0) {
    return 0;
  } else {
    return x;
  }
}

export function relu_prime(x) {
  if (x < 0) {
    return 0;
  } else {
    return 1;
  }
}

export function leaky_relu(x) {
  if (x < 0) {
    return 0.01 * x;
  } else {
    return x;
  }
}

export function leaky_relu_prime(x) {
  if (x < 0) {
    return 0.01;
  } else {
    return 1;
  }
}

export function soft_relu(x) {
  return Math.log(1 + Math.exp(x));
}

export function soft_relu_prime(x) {
  return 1 / (1 + Math.exp(x)) * Math.exp(x);
}

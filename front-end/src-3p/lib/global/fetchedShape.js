import PropTypes from "prop-types";

export function fetchedShape(shape) {
  return PropTypes.shape({
    error: PropTypes.any,
    fetching: PropTypes.bool,
    response: shape,
  });
}

import PropTypes from "prop-types";

export function graphqlResponseShape(shape) {
  return PropTypes.shape({
    data: PropTypes.shape(shape),
  });
}

export const contractorGroupShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  description: PropTypes.string,
});

export const jobTypeShape = PropTypes.shape({
  id: PropTypes.number,
  fullName: PropTypes.string,
  name: PropTypes.string,
  languageId: PropTypes.number,
});

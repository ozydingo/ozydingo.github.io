// Common component used to wrap data obtained with a `useFetcher` hook
// Handles error and fetching states, renders children otherwise.
//
// Basic usage:
// <Fetched fetched={hookResult}>
//   <ComponentToRender />
// </Fetched>

// Accepts `errorComponent`, `fetchingComponent`, and `noResponseComponent` to replace the boring defaults

import React from "react";

import PropTypes from "prop-types";

function Fetched(props) {
  const error = props.fetched.some(value => value.error);
  const fetching = !error && props.fetched.some(value => value.fetching);
  const response = !error && !fetching && props.fetched.every(value => value.response);

  if (error) {
    return props.errorComponent || (<div>Something went wrong :(</div>);
  } else if (fetching) {
    return props.fetchingComponent || (<div>Loading, please wait...</div>);
  } else if (response) {
    return props.children;
  } else {
    return props.noResponseComponent || (<div>There&apos;s nothing here...</div>);
  }
}

Fetched.propTypes = {
  children: PropTypes.node,
  fetched: PropTypes.arrayOf(
    PropTypes.shape({
      error: PropTypes.any,
      fetching: PropTypes.bool,
      response: PropTypes.any,
    })
  ).isRequired,
};

export default Fetched;

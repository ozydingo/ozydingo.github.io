// Common component used to wrap data obtained with a `useFetcher` hook
// Handles error and fetching states, renders children otherwise.
//
// Basic usage:
// <Fetched fetched={hookResult}>
//   <ComponentToRender />
// </Fetched>

// Accepts `errorComponent` and `fetchingComponent` to replace the boring defaults

import React from "react";

import PropTypes from "prop-types";

function Fetched(props) {
  if (props.fetched.error) {
    return props.errorComponent || (<div>Something went wrong :(</div>);
  } else if (props.fetched.fetching) {
    return props.fetchingComponent || (<div>Loading, please wait...</div>);
  } else {
    return props.children;
  }
}

Fetched.propTypes = {
  children: PropTypes.node,
  fetched: PropTypes.shape({
    error: PropTypes.bool,
    fetching: PropTypes.bool,
  }).isRequired
};

export default Fetched;

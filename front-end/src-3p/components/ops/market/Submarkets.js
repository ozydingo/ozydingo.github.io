import React from "react";

import PropTypes from "prop-types";

import SubmarketRules from "./SubmarketRules";

function Submarkets(props) {
  return (
    <div className="submarket-main">
      <SubmarketRules
        csrfToken={props.csrf_token}
      />
    </div>
  );
}

Submarkets.propTypes = {
  csrf_token: PropTypes.string,
};

export default Submarkets;

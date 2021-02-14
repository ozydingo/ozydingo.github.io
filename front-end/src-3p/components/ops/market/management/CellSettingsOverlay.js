import React, { useState } from "react";

import { css, StyleSheet } from "aphrodite";
import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";

function CellSettingsOverlay(props) {
  const [showSettingsIcon, setShowSettingsIcon] = useState(false);

  function activate() {
    setShowSettingsIcon(true);
  }

  function deactivate() {
    setShowSettingsIcon(false);
  }

  return (
    <div
      className={css(styles.overlay)}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
    >
      {showSettingsIcon && (
        <Button variant="link" size="sm" className="p-0" onClick={props.enter}>
          <i className={"fa fa-cog" + " " + css(styles.cog)} />
        </Button>
      )}
    </div>
  );
}

CellSettingsOverlay.propTypes = {
  enter: PropTypes.func,
};

const styles = StyleSheet.create({
  overlay: {
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    position: "absolute",
    padding: "3px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  cog: {
    color: "#797979",
    ":hover": {
      color: "#333333",
    }
  },
});

export default CellSettingsOverlay;

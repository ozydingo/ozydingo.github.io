import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, css } from "aphrodite";

const X_AXIS_LABELS = ["A", "B", "C", "D"];

const Y_AXIS_LABEL_PAIR = {
  0: "A",
  1: "B",
  2: "C",
  3: "D"
};

function TierBoxChart(props) {
  const potential_tiers = Object.keys(props.tiers);
  return (
    <>
      <div className={css(styles.y_axis_label, styles.axis_label)}>
        Potential Tier
      </div>
      <div className={css(styles.container)}>
        {potential_tiers.map((tier, i) => {
          const current_tiers = props.tiers[tier];
          return (
            <>
              {Object.keys(current_tiers).map((key, index) => {
                return (
                  <div key={key + ":" + index} className={css(styles.box)}>
                    {props.tiers[tier][key]}
                  </div>
                );
              })}
              {Y_AXIS_LABEL_PAIR[i] !== undefined &&
                yAxisLabelFromIndex(Y_AXIS_LABEL_PAIR[i])}
            </>
          );
        })}
        {X_AXIS_LABELS.map((label, index) => {
          return (
            <div key={index} className={css(styles.label_x)}>
              {label}
            </div>
          );
        })}
        <div className={css(styles.x_axis_label, styles.axis_label)}>
          Current Tier
        </div>
      </div>
    </>
  );
}

function yAxisLabelFromIndex(label) {
  return <div className={css(styles.label_y)}>{label}</div>;
}

const styles = StyleSheet.create({
  container: {
    width: "75%",
    display: "flex",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    margin: "auto"
  },
  box: {
    width: "20%",
    height: "9vw",
    lineHeight: "9vw",
    fontSize: "4rem",
    border: "#d4d4d4 2px solid",
    textAlign: "center",
    margin: "0.5rem",
    borderRadius: "5px"
  },
  label_x: {
    width: "20%",
    fontSize: "2rem",
    textAlign: "center",
    margin: "0.5rem"
  },
  label_y: {
    height: "9vw",
    lineHeight: "9vw",
    fontSize: "2rem",
    textAlign: "center",
    margin: "0.5rem",
    width: "5%"
  },
  x_axis_label: {
    position: "relative",
    left: "10rem",
    bottom: "2rem"
  },
  y_axis_label: {
    position: "relative",
    top: "0rem",
    right: "-6rem"
  },
  axis_label: {
    fontSize: "1.5rem"
  }
});

TierBoxChart.propTypes = {
  tiers: PropTypes.object
};

export default TierBoxChart;

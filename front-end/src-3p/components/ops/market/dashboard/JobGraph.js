import React, { useEffect, useMemo, useRef, useState } from "react";

import PropTypes from "prop-types";
import { StyleSheet, css } from "aphrodite";

import XAxis from "lib/global/d3play/XAxis";
import YAxis from "lib/global/d3play/YAxis";

// TODO: use more targeted imports, rather than "*"
import * as d3 from "d3";

import { alphaColor } from "lib/global/d3play/attributes";
import { jobShape } from "../shapes";
import { getLabel, getTransform } from "./jobGraphDataDictionary";

const margin = {top: 20, right: 20, bottom: 70, left: 40};
const outerWidth = 600;
const outerHeight = 300;
const innerWidth = outerWidth - margin.left - margin.right;
const innerHeight = outerHeight - margin.top - margin.bottom;

const xRange = [0, innerWidth];
const yRange = [innerHeight, 0];

function fill({color, opacity}) {
  return alphaColor(color, opacity);
}

function stroke({color, opacity}) {
  return input => alphaColor(color, opacity)(input).darker();
}

function sortedSelection(d3Selection) {
  const xRange = [d3Selection[0][0], d3Selection[1][0]].sort((a, b) => (a - b));
  const yRange = [d3Selection[0][1], d3Selection[1][1]].sort((a, b) => (a - b));
  return {xRange, yRange};
}

function JobGraph(props) {
  const svg = useRef(null);

  const sources = {};
  const setSource = {};
  sources.color = "priorityStars";
  sources.fillOpacity = "";
  sources.radius = "duration";
  sources.sort = "priorityStars";
  sources.strokeOpacity = "";
  sources.strokeWidth = "";
  [sources.x, setSource.x] = useState("hoursToDeadline");
  sources.xDomain = sources.x;
  [sources.y, setSource.y] = useState("accessCount");
  sources.yDomain = sources.y;

  // Returns a function that transforms a data value into a graph value.
  // Typically, this is a d3.scale instance.
  function transformer(feature) {
    return getTransform(sources[feature], feature);
  }

  // Returns a function that maps a job to the graph feature for that job.
  // Can aso return a const if the transform is const.
  function jobMapper(feature) {
    const sourceName = sources[feature];
    const tx = transformer(feature);
    if (typeof(tx) === "function") {
      return job => transformer(feature)(job[sourceName]);
    } else {
      return tx;
    }
  }

  function label(feature) {
    return getLabel(sources[feature] || feature);
  }

  const jobs = useMemo(() => processJobs(props.jobs), [props.jobs]);

  useEffect(update, [sources.x, sources.y]);
  useEffect(update, [svg.current, jobs]);

  function processJobs(propsJobs) {
    if (!propsJobs) { return []; }
    const processedJobs = [...propsJobs];
    const sortValue = jobMapper("sort");
    processedJobs.sort((a, b) => sortValue(a) - sortValue(b));
    return processedJobs;
  }

  function selectGraph() {
    return svg.current && d3.select(svg.current).select("g[data-id='graph']");
  }

  function update() {
    const graph = selectGraph();
    if (!graph) { return; }
    if (!jobs) { return; }

    const xValues = jobs.map(job => job[sources.x]);
    const yValues = jobs.map(job => job[sources.y]);
    // Compute the domain (input range) for x and y.
    const xDomain = transformer("xDomain")(xValues);
    const yDomain = transformer("yDomain")(yValues);
    // Apply the domain (input range) and range (output range) to the x and y scale functions.
    // This has a side-effect on jobMapper("x") and jobMapper("y"), which uses these scale functions.
    transformer("x").domain(xDomain).range(xRange);
    transformer("y").domain(yDomain).range(yRange);
    // The scale update is also required to update the axis lines and ticks:
    const xAxis = d3.axisBottom(transformer("x")).ticks(10);
    const yAxis = d3.axisLeft(transformer("y")).ticks(10);

    graph.select("g[data-id='x-axis']").call(xAxis);
    graph.select("g[data-id='y-axis']").call(yAxis);
    graph
      .select("g[data-id='data']")
      .selectAll("circle")
      .data(jobs)
      .join(
        enter => bindData(enter.append("circle")),
        update => bindData(update.transition()),
      );
    graph.select("g[data-id='data']").call(
      d3.brush()
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on("end", handleBrush)
      );
  }

  // Update the data visual attributes, to be used by both `enter` and `update` operations.
  function bindData(d3Selection) {
    d3Selection
      .attr("r", jobMapper("radius"))
      .attr("cx", jobMapper("x"))
      .attr("cy", jobMapper("y"))
      .style("fill", fill({
        color: jobMapper("color"),
        opacity: jobMapper("fillOpacity"),
      }))
      .style("stroke", stroke({
        color: jobMapper("color"),
        opacity: jobMapper("strokeOpacity"),
      }))
      .style("stroke-width", jobMapper("strokeWidth"));
  }

  // This function should go away in favor of a more generalized settings component
  function toggleX() {
    setSource.x(sources.x === "hoursToDeadline" ? "hoursOnMarket" : "hoursToDeadline");
  }

  // This function should go away in favor of a more generalized settings component
  function toggleY() {
    setSource.y(sources.y === "accessCount" ? "loggedInAccessCount" : "accessCount");
  }

  function handleBrush(event) {
    const { selection } = event;
    if (selection) {
      updateSelectionClasses(selection);
    } else {
      clearSelectionClasses();
    }
    const selectedJobs = getSelectedJobs(jobs, selection);
    props.onSelectJobs(selectedJobs);
  }

  function getSelectedJobs(jobs, selection) {
    if (!selection) { return []; }

    const {xRange, yRange} = sortedSelection(selection);
    return jobs.filter(job => isSelected(job, {xRange, yRange}));
  }

  function isSelected(job, {xRange, yRange}) {
    const jobX =  jobMapper("x")(job);
    const jobY = jobMapper("y")(job);
    return (
      xRange[0] <= jobX && jobX <= xRange[1]
      && yRange[0] <= jobY && jobY <= yRange[1]
    );
  }

  function updateSelectionClasses(selection) {
    const {xRange, yRange} = sortedSelection(selection);
    const selected = job => isSelected(job, {xRange, yRange});

    const selectionClass = job => selected(job) ? css(styles.selected) : css(styles.unselected);
    selectGraph()
      .select("g[data-id='data']")
      .selectAll("circle")
      .attr("class", selectionClass);
  }

  function clearSelectionClasses() {
    selectGraph()
      .select("g[data-id='data']")
      .selectAll("circle")
      .classed(css(styles.selected), false)
      .classed(css(styles.unselected), false);
  }

  return (
    <svg ref={svg} width={outerWidth} height={outerHeight}>
      <g data-id="graph" transform={`translate(${margin.left}, ${margin.top})`}>
        <g data-id="x-axis" onClick={toggleX} transform={`translate(0,${innerHeight})`}>
          <XAxis labelX={innerWidth}>{label("x")}</XAxis>
        </g>
        <g data-id="y-axis" onClick={toggleY}>
          <YAxis>{label("y")}</YAxis>
        </g>
        <g data-id="data"></g>
      </g>
    </svg>
  );
}

JobGraph.propTypes = {
  jobs: PropTypes.arrayOf(jobShape),
  onSelectJobs: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  selected: {
    opacity: 1
  },
  unselected: {
    opacity: 0.3
  }
});

export default JobGraph;

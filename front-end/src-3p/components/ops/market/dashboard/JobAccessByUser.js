import React, { useEffect, useRef } from "react";

import PropTypes from "prop-types";

import * as d3 from "d3";

import XAxis from "lib/global/d3play/XAxis";
import YAxis from "lib/global/d3play/YAxis";

import { contractorsPath } from "../paths";

const margin = {top: 20, right: 20, bottom: 70, left: 40};
const outerWidth = 600;
const outerHeight = 300;
const innerWidth = outerWidth - margin.left - margin.right;
const innerHeight = outerHeight - margin.top - margin.bottom;
const yPadBelowZero = 6;

const x = d3.scaleLinear().range([0, innerWidth]);
const y = d3.scaleLinear().range([innerHeight - yPadBelowZero, 0]);
const area = d3.area()
  .x((d, ii) => x(ii))
  .y0(y(0) + yPadBelowZero)
  .y1(contractor => y(contractor.availableJobAccessCount));

const xAxis = d3.axisBottom()
    .scale(x)
    .ticks(10);
const yAxis = d3.axisLeft()
    .scale(y)
    .ticks(10);

function JobAccessByUser(props) {
  const contractors = props.contractors || [];
  const svg = useRef(null);

  useEffect(setup, [svg.current]);
  useEffect(update, [svg.current, props.contractors]);

  function selectGraph() {
    return svg.current && d3.select(svg.current).select("g[data-id='graph']");
  }

  function setup() {
    const graph = selectGraph();
    if (!graph) { return; }

    graph.select("g[data-id='x-axis']").call(xAxis);
    graph.select("g[data-id='y-axis']").call(yAxis);
  }

  function update() {
    const graph = selectGraph();
    if (!graph) { return; }

    x.domain([0, contractors.length]);
    y.domain([0, d3.max(contractors, user => user.availableJobAccessCount)]);

    graph.select("g[data-id='x-axis']").call(xAxis);
    graph.select("g[data-id='y-axis']").call(yAxis);
    // Draw main area
    graph
      .select("g[data-id='data']")
      .selectAll("path")
      .data([contractors])
      .join("path")
      .style("fill", "steelblue")
      .style("stroke", "#115")
      .attr("d", area)
      .on("mousemove", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick);
    // Draw padding area below axes to allow selection of 0
    graph
      .select("g[data-id='data']")
      .selectAll("rect[data-role='zero-pad']")
      .data(contractors)
      .join("rect")
      .attr("pointer-events", "none")
      .attr("x", (d, ii) => x(ii))
      .attr("width", () => x(1))
      .attr("y", () => y(0))
      .attr("height", yPadBelowZero)
      .style("stroke", "none")
      .style("fill", "#ffffff88");
  }

  function handleMouseOver(event) {
    const xValue = x.invert(d3.pointer(event)[0]);
    const index = Math.max(0, Math.floor(xValue));
    const yValue = contractors[index].availableJobAccessCount;
    const yValues = contractors.map(d => d.availableJobAccessCount);
    const highestIndexWithSameValue = d3.bisect(yValues, yValue + 0.1);
    highlight(contractors, highestIndexWithSameValue);
  }

  function handleMouseOut() {
    highlight(contractors, 0);
  }

  function handleClick(event) {
    const xValue = x.invert(d3.pointer(event)[0]);
    const index = Math.max(0, Math.floor(xValue));
    const yValue = contractors[index].availableJobAccessCount;
    const url = contractorsPath({contractor_accesses_id_null: false, num_job_accesses_lteq: yValue, deleted_false: 1});
    window.open(url, '_blank');
  }

  function highlight(contractors, index) {
    const graph = selectGraph();

    const highlightArea = graph
      .selectAll("g[data-id='data-highlight']")
      .selectAll("path")
      .attr("pointer-events", "none")
      .data([contractors.slice(0,index)]);
    highlightArea.join("path")
      .style("fill", "#00000088")
      .attr("d", area);
  }

  return (
    <svg ref={svg} width={outerWidth} height={outerHeight}>
      <g data-id="graph" transform={`translate(${margin.left}, ${margin.top})`}>
        <g data-id="data"></g>
        <g data-id="data-highlight"></g>
        <g data-id="x-axis" transform={`translate(0,${innerHeight - yPadBelowZero})`}>
          <XAxis labelX={innerWidth}>User</XAxis>
        </g>
        <g data-id="y-axis">
          <YAxis labelY={0}># accesses</YAxis>
        </g>
      </g>
    </svg>
  );
}

JobAccessByUser.propTypes = {
  contractors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    availableJobAccessCount: PropTypes.number,
  }))
};

export default JobAccessByUser;

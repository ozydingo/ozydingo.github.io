import * as d3 from "d3";

export const defaults = {
  color: d3.scaleSequential([0, 1], d3.interpolatePlasma),
  fillOpacity: 0.5,
  radius: d3.scaleLinear([0, 1], [4, 15]).clamp(true),
  sort: d3.scaleLinear(),
  strokeOpacity: 0.8,
  strokeWidth: 3,
  x: d3.scaleLinear(),
  y: d3.scaleLinear(),
  xDomain: d3.extent,
  yDomain: d3.extent,
};

export const dictionary = {
  accessCount: {
    label: "# Accesses",
    yDomain: data => [0, d3.max(data)],
  },
  duration: {
    label: "Duration",
    radius: d3.scaleSequential(dur => 4 + 8 / Math.log(60) * Math.log(1 + (dur || 0) / 60000)),
  },
  hoursToDeadline: {
    label: "Hours to Deadline",
    xDomain: data => d3.extent(data).reverse(), // deadline on the right
  },
  loggedInAccessCount: {
    label: "# Accesses (logged in)",
    yDomain: data => [0, Math.max(10, d3.max(data))],
  },
  hoursOnMarket: {
    label: "Hours on Market",
    xDomain: data => [0, d3.max(data)],
  },
  priorityStars: {
    label: "Priority Stars",
    color: d3.scaleOrdinal([0, 1, 2, 3], ["#ddddcc", "#dddd33", "#ddaa22", "#ff3322"]),
  },
};

export function getTransform(dataFeature, visualFeature) {
  return dictionary[dataFeature] && dictionary[dataFeature][visualFeature] || defaults[visualFeature];
}

export function getLabel(dataFeature) {
  return dictionary[dataFeature] && dictionary[dataFeature].label || dataFeature;
}

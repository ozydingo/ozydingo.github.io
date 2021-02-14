import {color as d3Color} from "d3-color";

export function alphaColor(color, opacity) {
  return input => {
    const c = d3Color(color(input));
    if (typeof(opacity) === "number") {
      c.opacity = opacity;
    } else if (typeof(opacity) === "function") {
      c.opacity = opacity(input);
    }
    return c;
  };
}

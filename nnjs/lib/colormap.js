// Converts numeric value into color with a given color map
// TODO: implement more color schemes
nnjs.Colormap = function(preset) {
  this.preset = preset || 'yuletide'
}

nnjs.Colormap.prototype = {
  style: function(coef) {
    var rgba = this.rgba(coef)
    return 'rgb(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ')';
  },

  rgba: function(coef) {
    if (coef > 1) { coef = 1; }
    if (coef < 0) { coef = 0; }
    if (coef > 0.5) {
      var red = this.color_partial((coef - 0.5) / 0.5, 220, 220);
      var green = this.color_partial((coef - 0.5) / 0.5, 200, 100);
      var blue = this.color_partial((coef - 0.5) / 0.5, 200, 100);
    } else {
      var red = this.color_partial((0.5 - coef) / 0.5, 220, 100);
      var green = this.color_partial((0.5 - coef) / 0.5, 200, 200);
      var blue = this.color_partial((0.5 - coef) / 0.5, 200, 100);
    }
    // TODO: add gradient alpha support
    var alpha = 1;
    return [red, green, blue, alpha];
  },

  color_partial: function(x, min, max) {
    if (min === undefined) { min = 0; }
    if (max === undefined) { max = 255; }
    return math.round(min + (max - min) * x);
  }
}

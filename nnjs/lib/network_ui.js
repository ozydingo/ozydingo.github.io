nnjs.NetworkUI = function(runner) {
  this.runner = runner;
  this.listen();
}

nnjs.NetworkUI.prototype = {
  listen: function() {
    var ui = this;
    $(document).on("click", "#" + this.runner.network_svg.id + " .neuron", function(event) {
      var neuron = $(event.target);
      var layer = neuron.attr('data-layer');
      var index = neuron.attr('data-index');
      ui.runner.painter.select_neuron(layer, index);
    });
  },
}

var runner;

$(document).ready(function(){
  var network = new nnjs.Network([2,4,1]);
  var netsvg = $("#netsvg")[0];
  var outcvs = $("#output_canvas")[0];
  runner = new nnjs.Runner(network, netsvg, outcvs);
  runner.paint();
})

$(document).on("click", "#play", function() {
  $("#play").hide();
  $("#pause").show();
  runner.run();
});

$(document).on("click", "#pause", function() {
  $("#pause").hide();
  $("#play").show();
  runner.pause();
});

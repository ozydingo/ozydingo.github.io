var runner;
var netui;

$(document).ready(function(){
  var network = new nnjs.Network([2,4,1]);
  var netsvg = $("#netsvg")[0];
  var outcvs = $("#output_canvas")[0];
  runner = new nnjs.Runner(network, netsvg, outcvs);
  netui = new nnjs.NetworkUI(runner);
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

$(document).on("click", "#dec-layers", function() {
  var hacker = new nnjs.NetworkHacker(runner.network);
  hacker.remove_layer();
  runner.paint();
});

$(document).on("click", "#inc-layers", function() {
  var hacker = new nnjs.NetworkHacker(runner.network);
  hacker.add_layer(3);
  runner.paint();
});

var runner;
var netui;

$(document).ready(function(){
  var network = new nnjs.Network([2,4,1]);
  var netsvg = $("#netsvg")[0];
  var outcvs = $("#output_canvas")[0];
  var controls = $("#main-controls");
  runner = new nnjs.Runner(network, netsvg, outcvs);
  netui = new nnjs.NetworkUI(runner, controls);
  runner.paint();
})

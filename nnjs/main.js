import { NeuralNetwork } from './lib/neural_network.js'
import { NeuralNetworkUI } from './lib/neural_network_ui.js'
import { NeuralNetworkRunner } from './lib/neural_network_runner.js'

var runner;
var netui;

$(document).ready(function(){
  var network = new NeuralNetwork([2,4,1]);
  var netsvg = $("#netsvg")[0];
  var outcvs = $("#output_canvas")[0];
  var selcvs = $("#select_canvas")[0];
  var controls = $("#main-controls");
  runner = new NeuralNetworkRunner(network, netsvg, outcvs, selcvs);
  netui = new NeuralNetworkUI(runner, controls);
  runner.paint();
})

nnjs.Runner = function(network, network_svg, output_canvas) {
  this.network = network;
  this.network_svg = network_svg
  this.output_canvas = output_canvas
  this.painter = new nnjs.NetworkPainter(network_svg, network);
  this.mapper = new nnjs.NetworkMapper(this.network)
  this.output_graph = new nnjs.GraphXY(output_canvas)
  this.output_graph.zlim(0, 1);

  this.training_data = this.generate_training_data();
  this.batch_size = 100;

  this.timers = {};
}

nnjs.Runner.prototype = {
  run: function() {
    var runner = this;
    this.clear_timers();

    this.timers.training = setInterval(function(){runner.train_batch()}, 30)
    this.timers.painting = setInterval(function(){runner.paint_network()}, 200)
    this.timers.output = setInterval(function(){runner.paint_output()}, 100)
  },

  pause: function() {
    this.clear_timers();
  },

  clear_timers: function() {
    if (this.timers.training) {clearInterval(this.timers.training)};
    if (this.timers.painting) {clearInterval(this.timers.painting)};
    if (this.timers.output) {clearInterval(this.timers.output)};
  },

  restart_tratining_timer: function() {
    if (this.timers.training) {clearInterval(this.timers.training)}
  },

  generate_training_data: function(){
    return [
      {inputs: [0,0], output: [1]},
      {inputs: [0,1], output: [1]},
      {inputs: [1,0], output: [1]},
      {inputs: [1,1], output: [0]},
    ];
  },

  train_batch: function() {
    var sample_ii;
    var training_sample;
    for(var kk = 0; kk < this.batch_size; kk++) {
      sample_ii = math.floor(math.random(this.training_data.length));
      training_sample = this.training_data[sample_ii];
      this.network.train(training_sample.inputs, training_sample.output);
    }
  },

  log_to_console: function() {
    console.dir("0,0: " + this.network.forward([0,0]).activations[this.network.layers.length-1])
    console.dir("0,1: " + this.network.forward([0,1]).activations[this.network.layers.length-1])
    console.dir("1,0: " + this.network.forward([1,0]).activations[this.network.layers.length-1])
    console.dir("1,1: " + this.network.forward([1,1]).activations[this.network.layers.length-1])
  },

  paint: function() {
    this.paint_network();
    this.paint_output();
  },

  paint_network: function() {
    this.painter.paint();
  },

  paint_output: function() {
    var data = this.mapper.compute();
    this.output_graph.matrix(this.mapper.input_space[0], this.mapper.input_space[1], data)
  },
}

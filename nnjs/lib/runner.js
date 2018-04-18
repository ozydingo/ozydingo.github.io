nnjs.Runner = function(network, network_svg, output_canvas, select_canvas) {
  this.network = network;
  this.network_svg = network_svg
  this.output_canvas = output_canvas
  this.painter = new nnjs.NetworkPainter(network_svg, network);
  this.output_mapper = new nnjs.NetworkMapper(this.network)
  this.output_graph = new nnjs.GraphXY(output_canvas)
  this.output_graph.zlim(0, 1);
  this.select_graph = new nnjs.GraphXY(select_canvas)
  this.select_graph.zlim(0, 1);

  this.training_data = this.generate_training_data();
  this.batch_size = 100;

  this.timers = {};

  this.painter.paint();
}

nnjs.Runner.prototype = {
  run: function() {
    var runner = this;
    this.clear_timers();

    this.timers.training = setInterval(function(){runner.train_batch()}, 30)
    this.timers.painting = setInterval(function(){runner.update_network()}, 200)
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

  update: function() {
    this.update_network();
    this.paint_output();
  },

  paint_network: function() {
    this.painter.paint();
  },

  update_network: function() {
    this.painter.update();
  },

  paint_output: function() {
    this.output_graph.clear_canvas();
    this.select_graph.clear_canvas();
    var data = this.output_mapper.compute();
    this.output_graph.matrix(this.output_mapper.input_space[0], this.output_mapper.input_space[1], data);

    if (this.painter.selected_layer > 0 && this.painter.selected_index <= this.network.layers.length - 1) {
      var data = this.output_mapper.compute(undefined, [this.painter.selected_layer, this.painter.selected_index]);
      this.select_graph.matrix(this.output_mapper.input_space[0], this.output_mapper.input_space[1], data);
    } else {
      this.select_graph.clear_canvas();
    }
  },
}

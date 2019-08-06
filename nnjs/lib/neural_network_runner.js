import { DataModels } from "./data_models/data_models.js"
import { GraphXY } from "./graph_xy.js"
import { NetworkMapper } from "./network_mapper.js"
import { NetworkPainter } from "./network_painter.js"

export class NeuralNetworkRunner {
  constructor(network, network_svg, output_canvas, select_canvas) {
    this.state = "paused";
    this.network = network;
    this.network_svg = network_svg
    this.output_canvas = output_canvas
    this.select_canvas = select_canvas
    this.painter = new NetworkPainter(network_svg, network);
    this.output_mapper = new NetworkMapper(this.network)
    this.output_graph = new GraphXY(output_canvas)
    this.output_graph.xlim(0, 1);
    this.output_graph.ylim(0, 1);
    this.output_graph.zlim(0, 1);
    this.select_graph = new GraphXY(select_canvas)
    this.select_graph.xlim(0, 1);
    this.select_graph.ylim(0, 1);
    this.select_graph.zlim(0, 1);

    this.data_model = 'nand';
    this.set_training_data();
    this.batch_size = 20;

    this.timers = {};

    this.painter.paint();
  }

  // Start here. Run the network: continually train and visualize.
  run() {
    this.state = "playing";
    ['train', 'network', 'output'].forEach(name => execute_timer_function(name));
  }

  execute_timer_function(name) {
    if (this.state === "paused") { return; }
    switch(name){
      case 'train':
        this.train_batch();
        setTimeout(() => this.execute_timer_function('train'), 15);
        break;
      case 'network':
        this.update_network();
        setTimeout(() => this.execute_timer_function('network'), 200);
        break;
      case 'output':
        this.paint_output();
        setTimeout(() => this.execute_timer_function('output'), 50);
        break;
      default:
        throw(`Unrecognized timer function name ${name}`);
    }
  }

  pause() {
    this.state = "paused";
  }

  clear_timers() {
    if (this.timers.training) {clearInterval(this.timers.training)};
    if (this.timers.painting) {clearInterval(this.timers.painting)};
    if (this.timers.output) {clearInterval(this.timers.output)};
  }

  set_training_data() {
    this.training_data = this.generate_training_data();
  }

  generate_training_data(){
    if (this.data_model === 'nand') {
      return this.generate_nand_data();
    } else if (this.data_model === 'gblob') {
      return this.generate_gaussian_blob_data();
    } else if (this.data_model === 'ring') {
      return this.generate_ring_data();
    } else {
      throw 'Unsopprted data_model: ' + this.data_model;
    }
  }

  generate_nand_data() {
    return [
      {inputs: [0.1,0.1], output: [1]},
      {inputs: [0.1,0.9], output: [1]},
      {inputs: [0.9,0.1], output: [1]},
      {inputs: [0.9,0.9], output: [0]},
    ];
  }

  generate_gaussian_blob_data() {
    const n = 10;

    const model0 = new DataModels.GBlob(0.2, 0.6, 0.2, 0.6);
    const zeros = model0.generate(n).map(x => {
      return {inputs: x, output: [0]};
    });

    const model1 = new DataModels.GBlob(0.6, 0.7, 0.8, 0.7)
    const ones = model1.generate(n).map(x => {
      return {inputs: x, output: [1]};
    });

    return zeros.concat(ones);
  }

  generate_ring_data() {
    const n = 25;

    const model0 = new DataModels.Ring(0.5, 0.5, 0, 0.2);
    const zeros = model0.generate(n).map(x => ({inputs: x, output: [0]}));

    const model1 = new DataModels.Ring(0.5, 0.5, 0.3, 0.5);
    const ones = model1.generate(n).map(x => ({inputs: x, output: [1]}));

    return zeros.concat(ones);
  }

  train_batch() {
    let samples = new Array(this.batch_size);
    for (let ii=0; ii<100; ii++) {
      for (let jj=0; jj<samples.length; jj++) {
        let sample_ii = math.floor(math.random(this.training_data.length));
        samples[jj] = this.training_data[sample_ii];
      }
      let inputs = samples.map(x => x.inputs);
      let outputs = samples.map(x => x.output);
      this.network.train_batch(inputs, outputs);
    }
  }

  paint() {
    this.paint_network();
    this.paint_output();
  }

  update() {
    this.update_network();
    this.paint_output();
  }

  paint_network() {
    this.painter.paint();
  }

  update_network() {
    this.painter.update();
  }

  // Paint the intput-output map of the network. For 2-input networks, this is
  // a 2D matrix plot.
  paint_output() {
    this.output_graph.clear_canvas();
    this.select_graph.clear_canvas();
    const output_data = this.output_mapper.compute();
    this.output_graph.matrix(this.output_mapper.input_space[0], this.output_mapper.input_space[1], output_data);
    this.paint_data_on_output();

    if (this.painter.selected_layer > 0 && this.painter.selected_layer <= this.network.layers.length - 1) {
      const selected_data = this.output_mapper.compute(undefined, [this.painter.selected_layer, this.painter.selected_index]);
      this.select_graph.matrix(this.output_mapper.input_space[0], this.output_mapper.input_space[1], selected_data);
      this.paint_data_on_select();
    } else {
      this.select_graph.clear_canvas();
    }
  }

  // Plot training data on the whole-network input-output matrix canvas.
  paint_data_on_output() {
    const zero_data = this.training_data.filter(d => d.output[0] === 0);
    const zeros = zero_data.map(d => d.inputs)
    const one_data = this.training_data.filter(d => d.output[0] === 1);
    const ones = one_data.map(d => d.inputs)
    this.output_graph.scatter(zeros, ':dot', 0, 5);
    this.output_graph.scatter(ones, ':dot', 1, 5);
  }

  // Plot training data on the selected-neuron input-output matrix canvas.
  paint_data_on_select() {
    const zero_data = this.training_data.filter(d => d.output[0] === 0);
    const zeros = zero_data.map(d => d.inputs)
    const one_data = this.training_data.filter(d => d.output[0] === 1);
    const ones = one_data.map(d => d.inputs)
    this.select_graph.scatter(zeros, ':dot', 0, 5);
    this.select_graph.scatter(ones, ':dot', 1, 5);
  }
}

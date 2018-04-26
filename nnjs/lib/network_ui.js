// Responsible for managing UI listeners for a given runner and set of
// control elements (see index.html).
// TODO: Nest all selectors inside a container so we could create a netui for
// each network on a page (i.e. avoid global selectors such as $("#play"))
nnjs.NetworkUI = function(runner, controls) {
  this.runner = runner;
  this.controls = controls;
  this.control_elements = this.get_control_elements();

  this.setButtonStates();
  this.setGraphStates();
  this.listen();
}

nnjs.NetworkUI.prototype = {
  listen: function() {
    // Keep ref to `this` inside anon. functions to follow
    var ui = this;

    // Respond to neuron click by selecting it and updating the graphs
    $(document).on("click", "#" + this.runner.network_svg.id + " .neuron", function(event) {
      var neuron = $(event.target);
      var layer = neuron.attr('data-layer');
      var index = neuron.attr('data-index');
      ui.runner.painter.select_neuron(layer, index);
      ui.runner.paint();
      ui.setButtonStates();
      ui.setGraphStates();
    });

    // Update the graph states after every control action.
    $(document).on("click", this.controls, function() {
      ui.setGraphStates();
    }),

    // Run the network.
    $(document).on("click", "#play", function() {
      $("#play").hide();
      $("#pause").show();
      runner.run();
    });

    // Pause the network.
    $(document).on("click", "#pause", function() {
      $("#pause").hide();
      $("#play").show();
      runner.pause();
    });

    // Remove the last hidden layer.
    $(document).on("click", "#dec-layers", function() {
      if (runner.painter.selected_layer === runner.network.layers.length - 2) {
        runner.painter.unselect_neuron();
      }
      var hacker = new nnjs.NetworkHacker(runner.network);
      hacker.remove_layer();
      runner.paint();
    });

    // Add a new hidden layer.
    $(document).on("click", "#inc-layers", function() {
      var hacker = new nnjs.NetworkHacker(runner.network);
      hacker.add_layer(3);
      runner.paint();
    });

    // Remove the last neuron in the selected layer.
    $(document).on("click", "#dec-neurons", function() {
      var layer = runner.painter.selected_layer;
      if(layer === null) {return;}

      if (runner.painter.selected_index === runner.network.layers[layer].length - 1) {
        runner.painter.unselect_neuron();
      }

      var hacker = new nnjs.NetworkHacker(runner.network);
      hacker.remove_neuron(layer);
      runner.paint();
    });

    // Add a neuron to the selected layer.
    $(document).on("click", "#inc-neurons", function() {
      var layer = runner.painter.selected_layer;
      if(layer === null) {return;}

      var hacker = new nnjs.NetworkHacker(runner.network);
      hacker.add_neuron(layer);
      runner.paint();
    });

    // Reset training data when the data model is changed.
    $(document).on("change", "#data-model", function(event) {
      var model = $(event.target).find("option:selected").val();
      if (model === undefined) {
        console && console.log && console.log(event);
        throw "Error setting data model; event logged to console";
      }
      runner.data_model = model;
      runner.set_training_data();
      runner.paint();
      ui.setGraphStates();
    })

    // Add user-generated training data on left-click
    $(document).on("click", "#output_canvas", function(event) {
      var x = runner.output_graph.px_to_x(event.offsetX);
      var y = runner.output_graph.px_to_y(event.offsetY);
      ui.addTrainingDatum(x, y, 0);
      ui.setGraphStates();
    });

    // Add user-generated training data on right-click
    $(document).on("contextmenu", "#output_canvas", function(event) {
      var x = runner.output_graph.px_to_x(event.offsetX);
      var y = runner.output_graph.px_to_y(event.offsetY);
      ui.addTrainingDatum(x, y, 1);
      ui.setGraphStates();
      event.preventDefault();
    });
  },

  //----- private-ish -----//

  get_control_elements: function() {
    return {
      play: $(this.controls).find('[data-function=play]'),
      pause: $(this.controls).find('[data-function=pause]'),
      inc_layers: $(this.controls).find('[data-function=inc-layers]'),
      dec_layers: $(this.controls).find('[data-function=dec-layers]'),
      inc_neurons: $(this.controls).find('[data-function=inc-neurons]'),
      dec_neurons: $(this.controls).find('[data-function=dec-neurons]'),
      data_model: $(this.controls).find('[data-function=data-model]')
    };
  },

  // Disable network modifier buttons when appropriate.
  setButtonStates: function() {
    var layer = runner.painter.selected_layer;
    var ctrl_group = this.control_elements["inc_neurons"].closest(".ctrl-group");
    if (layer === null || layer === 0 || layer === runner.network.layers.length - 1) {
      ctrl_group.addClass("disabled");
      ctrl_group.tooltip('enable');
    } else {
      ctrl_group.removeClass("disabled");
      ctrl_group.tooltip('disable');
    }
  },

  // Enable or disable tooltips on graphs to suggest actions to the user.
  setGraphStates: function() {
    var layer = runner.painter.selected_layer;
    if (layer === null) {
      $(runner.select_canvas).tooltip('enable');
    } else {
      $(runner.select_canvas).tooltip('disable');
    }

    var data_model = this.control_elements.data_model.find("select").find("option:selected").val()
    if (data_model !== 'custom') {
      $(runner.output_canvas).tooltip('enable');
    } else {
      $(runner.output_canvas).tooltip('disable');
    }
  },

  // Add the specified input/output training datum to the runner.
  addTrainingDatum: function(x, y, output) {
    this.control_elements["data_model"].find("option[value=custom]").prop('selected', true)

    this.runner.training_data.push({
      inputs: [x, y],
      output: [output]
    });

    this.runner.paint();
  },
}

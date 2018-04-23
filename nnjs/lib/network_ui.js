nnjs.NetworkUI = function(runner, controls) {
  this.runner = runner;
  this.controls = controls;
  this.control_elements = this.get_control_elements();

  this.setButtonStates();
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
      ui.runner.paint();
      ui.setButtonStates();
    });

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
      if (runner.painter.selected_layer === runner.network.layers.length - 2) {
        runner.painter.unselect_neuron();
      }
      var hacker = new nnjs.NetworkHacker(runner.network);
      hacker.remove_layer();
      runner.paint();
    });

    $(document).on("click", "#inc-layers", function() {
      var hacker = new nnjs.NetworkHacker(runner.network);
      hacker.add_layer(3);
      runner.paint();
    });

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

    $(document).on("click", "#inc-neurons", function() {
      var layer = runner.painter.selected_layer;
      if(layer === null) {return;}

      var hacker = new nnjs.NetworkHacker(runner.network);
      hacker.add_neuron(layer);
      runner.paint();
    });

    $(document).on("change", "#data-model", function(event) {
      var model = $(event.target).find("option:selected").val();
      if (model === undefined) {
        console && console.log && console.log(event);
        throw "Error setting data model; event logged to console";
      }
      runner.data_model = model;
      runner.set_training_data();
      runner.paint();
    })
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
    };
  },

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
  }
}

(function(window, document, videojs) {
  var registerPlugin = videojs.registerPlugin || videojs.plugin;
  var dom = videojs.dom || videojs;
  var audioPlayer = function(settings) {
    var player = this;
    var defaults = {
      noFullscreen: true
    };
    var Component = videojs.getComponent('Component');
    var ControlBarDock;

    settings =  videojs.mergeOptions(defaults,settings);

    if (settings.noFullscreen) {
      var fsButton = player.controlBar.getChild('FullscreenToggle');
      fsButton.hide();
    }

    ControlBarDock = videojs.extend(Component, {
      constructor: function(player, options) {
        Component.call(this, player, options);
        var self = this;
        var checkMeta = function() {
          if(this.player_.mediainfo && this.player_.mediainfo.name) {
            var title = this.player_.mediainfo.name;
          }
          self.update(title);
        }
        this.player_.on('loadstart', checkMeta);
      },
      createEl: function() {
        var title = dom.createEl('div', {
          className: 'vjs-control-dock-title'
        });
        var el = dom.createEl('div', {
          className: 'vjs-control-dock vjs-control'
        });

        this.title = title;
        el.appendChild(title);
        return el;
      },
      update: function(title) {
        this.title.textContent = title;
      }
    });
    videojs.registerComponent('ControlBarDock', ControlBarDock);
    var spacer = player.controlBar.getChild('CustomControlSpacer');
    var index;
    if (spacer) {
      index = player.controlBar.children_.indexOf(spacer);
    }
    player.controlBar.addChild('controlBarDock', {}, index);
    player.options.inactivityTimeout = 0;
    player.userActive(true);
    player.bigPlayButton.hide();
  }
  registerPlugin('audioPlayer', audioPlayer);
})(window, document, videojs);

// Use plugin with your player
bc('audio').audioPlayer({});

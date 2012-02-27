(function() {
  var common, core, editor, game, meta;

  common = window.common;

  game = window.game;

  editor = (window.editor || (window.editor = {}));

  meta = common.meta2;

  core = meta.def('editor.core', {
    init: function() {
      var _this = this;
      this.viewport = editor.viewport.init(this);
      this.$sidebar = $('#editor-sidebar select');
      this.$mapChooser = $('#editor-map-chooser select');
      this.$layerChooser = $('#editor-layer-chooser').attr('disabled', 'disabled');
      this._resizeUI();
      $(window).resize(function() {
        return _this._resizeUI();
      });
      this._loadImages();
      return this._whenImagesLoaded(function() {
        _this._populateSidebar();
        _this.$mapChooser.change(function() {
          return _this._chooseMap(_this.value);
        });
        return _this.$layerChooser.change(function() {
          return _this._chooseLayer(_this.value);
        });
      });
    },
    _resizeUI: function() {
      var h, nh, wh;
      wh = $(window).height();
      nh = $('#editor-nav').height();
      h = wh - nh;
      this.viewport.setHeight(h);
      return this.$sidebar.height(wh - nh);
    },
    _loadImages: function() {
      return game.imageCollection.load();
    },
    _whenImagesLoaded: function(fn) {
      var check, t, timer;
      t = new Date();
      timer = null;
      check = function() {
        var t2;
        t2 = new Date();
        if ((t2 - t) > (10 * 1000)) {
          window.clearTimeout(timer);
          timer = null;
          console.log("Not all images were loaded!");
          return;
        }
        console.log("Checking to see if all images have been loaded...");
        if (game.imageCollection.isLoaded()) {
          console.log("Yup, looks like all images are loaded now.");
          window.clearTimeout(timer);
          timer = null;
          return fn();
        } else {
          return timer = window.setTimeout(check, 300);
        }
      };
      return check();
    },
    _populateSidebar: function() {
      var _this = this;
      return game.imageCollection.each(function(image) {
        return _this.$sidebar.append(image.getElement());
      });
    },
    _chooseMap: function(mapName) {
      var map;
      if (this.currentMap) {
        this.currentMap.detach();
        this.currentMap.unload();
      } else {
        this.$layerChooser.attr('disabled', '');
      }
      map = game.mapCollection.get(mapName);
      map.setParent(this.viewport);
      map.load();
      map.attach();
      this.viewport.setMap(map);
      return this.currentLayer = 'foreground';
    },
    _chooseLayer: function(layerName) {
      this.currentMap[this.currentLayer].deactivate();
      return this.currentMap[layerName].activate();
    }
  });

  editor.core = core;

}).call(this);

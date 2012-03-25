(function() {

  define('editor.core', function() {
    var LAYER_KEYS, LAYER_NAMES, ONE_KEY, TWO_KEY, meta, util;
    meta = require('meta');
    util = require('util');
    ONE_KEY = 49;
    TWO_KEY = 50;
    LAYER_NAMES = ['fill', 'tiles'];
    LAYER_KEYS = [ONE_KEY, TWO_KEY];
    return meta.def({
      _createMapGrid: function() {
        var canvas, ctx;
        canvas = require('game.canvas').create(16, 16);
        ctx = canvas.getContext();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(16, 0.5);
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(0.5, 16);
        ctx.stroke();
        return this.mapGrid = canvas;
      },
      init: function() {
        var _this = this;
        this._createMapGrid();
        this.viewport = require('editor.viewport').init(this);
        this.$sidebar = $('#editor-sidebar');
        this.$mapChooser = $('#editor-map-chooser select');
        this._resizeUI();
        $(window).resize(function() {
          return _this._resizeUI();
        });
        this._loadImages();
        return this._whenImagesLoaded(function() {
          _this._populateMapObjects();
          _this.viewport.loadMap();
          _this._initToolbox();
          return _this._initLayers();
        });
      },
      getLayers: function() {
        return LAYER_NAMES;
      },
      getCurrentLayer: function() {
        return this.currentLayer;
      },
      getCurrentLayerElem: function() {
        return this.findLayer(this.getCurrentLayer());
      },
      findLayer: function(layer) {
        return this.viewport.$map.find(".editor-layer[data-layer=" + layer + "]");
      },
      _resizeUI: function() {
        var h, nh, sw, wh, win, ww;
        win = $.viewport();
        wh = win.height;
        ww = win.width;
        nh = $('#editor-nav').offset().height;
        sw = this.$sidebar.offset().width;
        this.viewport.setWidth(ww - sw);
        h = wh - nh;
        this.viewport.setHeight(h);
        return this.$sidebar.height(h);
      },
      _loadImages: function() {
        return require('game.imageCollection').load();
      },
      _whenImagesLoaded: function(fn) {
        var check, imageCollection, t, timer;
        t = new Date();
        timer = null;
        imageCollection = require('game.imageCollection');
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
          if (imageCollection.isLoaded()) {
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
      _populateMapObjects: function() {
        var imageCollection, spriteCollection,
          _this = this;
        imageCollection = require('game.imageCollection');
        spriteCollection = require('game.spriteCollection');
        this.objects = [];
        this.objectsByName = {};
        spriteCollection.each(function(sprite) {
          var dims, name, obj;
          name = sprite.name;
          if (_this.objectsByName[name]) return;
          dims = {
            w: sprite.width,
            h: sprite.height
          };
          obj = {
            name: name,
            dims: dims,
            object: sprite,
            image: sprite.image
          };
          _this.objects.push(obj);
          return _this.objectsByName[name] = obj;
        });
        imageCollection.each(function(image) {
          var dims, name, obj;
          name = image.name;
          if (name === 'link2x') return;
          if (_this.objectsByName[name]) return;
          dims = {
            w: image.width,
            h: image.height
          };
          obj = {
            name: name,
            dims: dims,
            object: image,
            image: image
          };
          _this.objects.push(obj);
          return _this.objectsByName[name] = obj;
        });
        this.objects = this.objects.sort(function(x1, x2) {
          var d1, d2, h1, h2, w1, w2, _ref, _ref2, _ref3;
          _ref = [x1.dims, x2.dims], d1 = _ref[0], d2 = _ref[1];
          _ref2 = [d1.w, d1.h].reverse(), w1 = _ref2[0], h1 = _ref2[1];
          _ref3 = [d2.w, d2.h].reverse(), w2 = _ref3[0], h2 = _ref3[1];
          if (w1 > w2) {
            return 1;
          } else if (w1 < w2) {
            return -1;
          } else if (h1 > h2) {
            return 1;
          } else if (h1 < h2) {
            return -1;
          } else {
            return 0;
          }
        });
        return $.v.each(this.objects, function(so) {
          var $elem;
          $elem = so.$elem = $("<div/>").addClass('img').data('name', so.object.name).width(so.dims.w).height(so.dims.h).append(so.image.getElement());
          return $elem.data('so', so);
        });
      },
      _populateSidebar: function() {
        var elems, evtns,
          _this = this;
        if (this.sidebarPopulated) return;
        elems = [];
        $.v.each(this.objects, function(so) {
          _this.$sidebar.find('> div[data-layer=tiles]').append(so.$elem);
          return elems.push(so.$elem[0]);
        });
        evtns = 'editor.core.sidebar';
        $(elems).dragObject({
          helper: true,
          dropTarget: this.viewport.$element
        }).bind("mousedragstart." + evtns, function(evt) {
          var $draggee, $helper, dragObject;
          console.log("" + evtns + ": mousedragstart");
          $draggee = $(this);
          dragObject = $draggee.data('dragObject');
          $helper = dragObject.getHelper();
          return $helper.addClass('editor-map-object');
        });
        return this.sidebarPopulated = true;
      },
      _initLayers: function() {
        var layer, that, _i, _j, _len, _len2,
          _this = this;
        that = this;
        for (_i = 0, _len = LAYER_NAMES.length; _i < _len; _i++) {
          layer = LAYER_NAMES[_i];
          this.$sidebar.append("<div data-layer=\"" + layer + "\"></div>");
        }
        this.$layerChooser = $('#editor-layer-chooser select').change(function() {
          return that._chooseLayer(this.value);
        });
        for (_j = 0, _len2 = LAYER_NAMES.length; _j < _len2; _j++) {
          layer = LAYER_NAMES[_j];
          this.$layerChooser.append("<option data-layer=\"" + layer + "\">" + layer + "</option>");
        }
        this._changeLayerTo(1);
        return $(window).bind('keyup', function(evt) {
          var index;
          index = LAYER_KEYS.indexOf(evt.keyCode);
          if (index !== -1) return _this._changeLayerTo(index);
        });
      },
      _changeLayerTo: function(index) {
        this.$layerChooser[0].selectedIndex = index;
        return this.$layerChooser.change();
      },
      _chooseLayer: function(layer) {
        var $layer, $map, _name, _name2, _name3, _name4;
        if (this.currentLayer) {
          if (this.currentTool) {
            if (typeof this[_name = "deactivate_" + this.currentLayer + "_" + this.currentTool + "_tool"] === "function") {
              this[_name]();
            }
          }
          if (typeof this[_name2 = "deactivate_" + this.currentLayer + "_layer"] === "function") {
            this[_name2]();
          }
        }
        this.currentLayer = layer;
        $map = this.viewport.$map;
        $layer = $map.find('.editor-layer').removeClass('editor-layer-selected');
        $layer.find('.editor-layer-content').css('background', 'none');
        $layer.find('.editor-layer-bg').css('background', 'none');
        $layer = $map.find(".editor-layer[data-layer=" + layer + "]").addClass('editor-layer-selected');
        $layer.find('.editor-layer-content').css('background-image', "url(" + (this.mapGrid.element.toDataURL()) + ")").css('background-repeat', 'repeat');
        $layer.find('.editor-layer-bg').css('background-color', 'white');
        this.$sidebar.find('> div').hide();
        this.$sidebar.find("> div[data-layer=" + layer + "]").show();
        if (typeof this[_name3 = "activate_" + this.currentLayer + "_layer"] === "function") {
          this[_name3]();
        }
        return typeof this[_name4 = "activate_" + this.currentLayer + "_" + this.currentTool + "_tool"] === "function" ? this[_name4]() : void 0;
      },
      _initToolbox: function() {
        var that;
        that = this;
        this.$toolbox = $('<div id="editor-toolbox"/>');
        this.viewport.$element.append(this.$toolbox);
        this.currentTool = null;
        return this.prevTool = null;
      },
      _initTools: function(tools) {
        var evtns, that,
          _this = this;
        that = this;
        evtns = 'editor.core.tools';
        this._destroyTools();
        $.v.each(tools, function(tool) {
          var $tool;
          $tool = $("<img src=\"/images/editor/tool-" + tool + ".gif\" data-tool=\"" + tool + "\">");
          return _this.$toolbox.append($tool);
        });
        this.$toolbox.find('> img').bind("click." + evtns, function() {
          var tool;
          tool = $(this).data('tool');
          return that._selectTool(tool);
        });
        this._selectTool('normal');
        if ($.includes(tools, 'hand')) return this._initHandTool();
      },
      _destroyTools: function() {
        var evtns;
        evtns = 'editor.core.tools';
        this.$toolbox.find('> img').unbind('.' + evtns);
        $(window).unbind('.' + evtns);
        return this.$toolbox.html("");
      },
      _initHandTool: function() {
        var CTRL_KEY, SHIFT_KEY, evtns, mouse,
          _this = this;
        evtns = 'editor.core.tools';
        SHIFT_KEY = 16;
        CTRL_KEY = 17;
        mouse = {};
        return $(window).bind("keydown." + evtns, function(evt) {
          if (evt.keyCode === SHIFT_KEY) {
            _this.prevTool = _this.currentTool;
            _this._selectTool('hand');
            return evt.preventDefault();
          }
        }).bind("keyup." + evtns, function(evt) {
          if (evt.keyCode === SHIFT_KEY) {
            _this._selectTool(_this.prevTool);
            return _this.prevTool = null;
          }
        }).bind("mousemove." + evtns, function(evt) {
          mouse.x = evt.pageX;
          return mouse.y = evt.pageY;
        });
      },
      _selectTool: function(tool) {
        var $tool, am1, am2, currentLayer, dm1, dm2, _base, _base2, _base3, _base4;
        console.log("selecting " + tool + " tool");
        $tool = this.$toolbox.find("> [data-tool='" + tool + "']");
        this.$toolbox.find('> img').removeClass('editor-active');
        $tool.addClass('editor-active');
        this.viewport.$element.removeClassesLike(/^editor-tool-/).addClass("editor-tool-" + tool);
        currentLayer = this.getCurrentLayer();
        dm1 = "deactivate_" + currentLayer + "_" + this.currentTool + "_tool";
        dm2 = "deactivate_" + this.currentTool + "_tool";
        if (this.currentTool) {
          if (typeof this[dm1] === "function") this[dm1]();
          if (typeof (_base = this.viewport)[dm1] === "function") _base[dm1]();
          if (typeof this[dm2] === "function") this[dm2]();
          if (typeof (_base2 = this.viewport)[dm2] === "function") _base2[dm2]();
        }
        this.currentTool = tool;
        am1 = "activate_" + currentLayer + "_" + this.currentTool + "_tool";
        am2 = "activate_" + this.currentTool + "_tool";
        if (typeof this[am1] === "function") this[am1]();
        if (typeof (_base3 = this.viewport)[am1] === "function") _base3[am1]();
        if (typeof this[am2] === "function") this[am2]();
        return typeof (_base4 = this.viewport)[am2] === "function" ? _base4[am2]() : void 0;
      },
      activate_fill_layer: function() {
        console.log('core: activating fill layer');
        return this._initTools(['normal', 'hand', 'select', 'bucket']);
      },
      activate_tiles_layer: function() {
        console.log('core: activating tiles layer');
        this._initTools(['normal', 'hand']);
        return this._populateSidebar();
      }
    });
  });

}).call(this);

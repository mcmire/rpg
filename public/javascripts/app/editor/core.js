(function() {

  define('editor.core', function() {
    var LAYER_KEYS, LAYER_NAMES, ONE_KEY, TWO_KEY, meta, util;
    meta = require('meta');
    util = require('util');
    require('editor.DragObject');
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
          _this._initLayers();
          _this._initToolbox();
          return _this._changeLayerTo(0);
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
          dropTarget: this.viewport.getElement()
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
          return that._selectLayer(this.value);
        });
        for (_j = 0, _len2 = LAYER_NAMES.length; _j < _len2; _j++) {
          layer = LAYER_NAMES[_j];
          this.$layerChooser.append("<option data-layer=\"" + layer + "\">" + layer + "</option>");
        }
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
      _selectLayer: function(layer) {
        var $layer, $map;
        this._deactivateCurrentLayer();
        this.currentLayer = layer;
        $map = this.viewport.$map;
        $(document.body).removeClassesLike(/^editor-layer-/).addClass("editor-layer-" + layer);
        $layer = $map.find('.editor-layer').removeClass('editor-layer-selected');
        $layer.find('.editor-layer-content').css('background', 'none');
        $layer.find('.editor-layer-bg').css('background', 'none');
        $layer = $map.find(".editor-layer[data-layer=" + layer + "]").addClass('editor-layer-selected');
        $layer.find('.editor-layer-content').css('background-image', "url(" + (this.mapGrid.element.toDataURL()) + ")").css('background-repeat', 'repeat');
        $layer.find('.editor-layer-bg').css('background-color', 'white');
        this.$sidebar.find('> div').hide();
        this.$sidebar.find("> div[data-layer=" + layer + "]").show();
        return this._activateCurrentLayer();
      },
      _activateCurrentLayer: function() {
        var m, _base;
        m = "activate_" + this.currentLayer + "_layer";
        console.log("viewport: activating " + this.currentLayer + " layer");
        if (typeof (_base = this.viewport)[m] === "function") _base[m]();
        console.log("core: activating " + this.currentLayer + " layer");
        if (typeof this[m] === "function") this[m]();
        return this._activateCurrentTool();
      },
      _deactivateCurrentLayer: function() {
        var m, _base;
        m = "deactivate_" + this.currentLayer + "_layer";
        if (this.currentLayer) {
          if (this.currentTool) this._deactivateCurrentTool();
          console.log("core: deactivating " + this.currentLayer + " layer");
          if (typeof this[m] === "function") this[m]();
          console.log("viewport: deactivating " + this.currentLayer + " layer");
          return typeof (_base = this.viewport)[m] === "function" ? _base[m]() : void 0;
        }
      },
      _initToolbox: function() {
        var that;
        that = this;
        this.$toolbox = $('<div id="editor-toolbox"/>');
        this.viewport.getElement().append(this.$toolbox);
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
        this.currentTool = 'normal';
        if ($.includes(tools, 'hand')) return this._initHandTool();
      },
      _destroyTools: function() {
        var evtns;
        evtns = 'editor.core.tools';
        this.$toolbox.find('> img').unbind('.' + evtns);
        this.$toolbox.html("");
        return $(window).unbind('.' + evtns);
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
        this._deactivateCurrentTool();
        this.currentTool = tool;
        return this._activateCurrentTool();
      },
      _activateCurrentTool: function() {
        var $tool, m1, m2, _base, _base2;
        $tool = this.$toolbox.find("> [data-tool='" + this.currentTool + "']");
        $tool.addClass('editor-active');
        $(document.body).addClass("editor-tool-" + this.currentTool);
        m1 = "activate_" + this.currentTool + "_tool";
        m2 = "activate_" + this.currentLayer + "_" + this.currentTool + "_tool";
        console.log("viewport: activating " + this.currentTool + " tool");
        if (typeof (_base = this.viewport)[m1] === "function") _base[m1]();
        console.log("core: activating " + this.currentTool + " tool");
        if (typeof this[m1] === "function") this[m1]();
        console.log("viewport: activating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
        if (typeof (_base2 = this.viewport)[m2] === "function") _base2[m2]();
        console.log("core: activating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
        return typeof this[m2] === "function" ? this[m2]() : void 0;
      },
      _deactivateCurrentTool: function() {
        var $tool, m1, m2, _base, _base2;
        $tool = this.$toolbox.find("> [data-tool='" + this.currentTool + "']");
        $tool.removeClass('editor-active');
        $(document.body).removeClass("editor-tool-" + this.currentTool);
        m1 = "deactivate_" + this.currentTool + "_tool";
        m2 = "deactivate_" + this.currentLayer + "_" + this.currentTool + "_tool";
        if (this.currentTool) {
          if (this.currentLayer) {
            console.log("core: deactivating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
            if (typeof this[m2] === "function") this[m2]();
            console.log("viewport: deactivating " + this.currentTool + " tool (layer: " + this.currentLayer + ")");
            if (typeof (_base = this.viewport)[m2] === "function") _base[m2]();
          }
          console.log("core: deactivating " + this.currentTool + " tool");
          if (typeof this[m1] === "function") this[m1]();
          console.log("viewport: deactivating " + this.currentTool + " tool");
          return typeof (_base2 = this.viewport)[m1] === "function" ? _base2[m1]() : void 0;
        }
      },
      activate_fill_layer: function() {
        return this._initTools(['normal', 'hand', 'select', 'bucket']);
      },
      activate_tiles_layer: function() {
        return this._initTools(['normal', 'hand']);
      },
      activate_tiles_normal_tool: function() {
        return this._populateSidebar();
      }
    });
  });

}).call(this);

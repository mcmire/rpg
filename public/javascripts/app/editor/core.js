(function() {

  define('editor.core', function() {
    var meta, util;
    meta = require('meta');
    util = require('util');
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
        var ONE_KEY, TWO_KEY, layer, that, _i, _j, _len, _len2, _ref, _ref2,
          _this = this;
        that = this;
        ONE_KEY = 49;
        TWO_KEY = 50;
        this._createMapGrid();
        this.layers = {
          names: ['fill', 'tiles'],
          keys: [ONE_KEY, TWO_KEY],
          init: function() {
            that.$layerChooser[0].selectedIndex = 1;
            return that.$layerChooser.change();
          },
          choose: function(layer) {
            var $layer, $map, _name, _name2, _name3, _name4;
            if (this.current) {
              if (that.currentTool) {
                if (typeof that[_name = "_deactivate_" + this.current + "_" + that.currentTool + "_tool"] === "function") {
                  that[_name]();
                }
              }
              if (typeof that[_name2 = "_deactivate_" + this.current + "_layer"] === "function") {
                that[_name2]();
              }
            }
            this.current = layer;
            $map = that.viewport.$map;
            $layer = $map.find('.editor-layer').removeClass('editor-layer-selected');
            $layer.find('.editor-layer-content').css('background', 'none');
            $layer.find('.editor-layer-bg').css('background', 'none');
            $layer = $map.find(".editor-layer[data-layer=" + layer + "]").addClass('editor-layer-selected');
            $layer.find('.editor-layer-content').css('background-image', "url(" + (that.mapGrid.element.toDataURL()) + ")").css('background-repeat', 'repeat');
            $layer.find('.editor-layer-bg').css('background-color', 'white');
            that.$sidebar.find('> div').hide();
            that.$sidebar.find("> div[data-layer=" + layer + "]").show();
            if (typeof that[_name3 = "_activate_" + this.current + "_layer"] === "function") {
              that[_name3]();
            }
            return typeof that[_name4 = "_activate_" + this.current + "_" + that.currentTool + "_tool"] === "function" ? that[_name4]() : void 0;
          }
        };
        $(window).bind('keyup', function(evt) {
          var index;
          index = _this.layers.keys.indexOf(evt.keyCode);
          if (index !== -1) {
            _this.$layerChooser[0].selectedIndex = index;
            return _this.$layerChooser.change();
          }
        });
        this.viewport = require('editor.viewport').init(this);
        this.$sidebar = $('#editor-sidebar');
        _ref = this.layers.names;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          this.$sidebar.append("<div data-layer=\"" + layer + "\"></div>");
        }
        this.$layerChooser = $('#editor-layer-chooser select').change(function() {
          return that.layers.choose(this.value);
        });
        _ref2 = this.layers.names;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          layer = _ref2[_j];
          this.$layerChooser.append("<option data-layer=\"" + layer + "\">" + layer + "</option>");
        }
        this.$mapChooser = $('#editor-map-chooser select');
        this._resizeUI();
        $(window).resize(function() {
          return _this._resizeUI();
        });
        this._loadImages();
        return this._whenImagesLoaded(function() {
          _this._populateSidebar();
          _this.viewport.loadMap();
          _this._initToolbox();
          return _this.layers.init();
        });
      },
      getLayers: function() {
        return this.layers.names;
      },
      getCurrentLayer: function() {
        return this.layers.current;
      },
      getCurrentLayerElem: function() {
        return this.findLayer(this.getCurrentLayer());
      },
      findLayer: function(layer) {
        return this.viewport.$map.find(".editor-layer[data-layer=" + layer + "]");
      },
      enableDragSnapping: function(size) {
        return this.snapDragToGrid = size;
      },
      disableDragSnapping: function() {
        return this.snapDragToGrid = null;
      },
      rememberDragObject: function(_arg) {
        this.$elemBeingDragged = _arg[0], this.objectBeingDragged = _arg[1];
        return $(document.body).append(this.$elemBeingDragged);
      },
      forgetDragObject: function() {
        var a, b, _ref;
        _ref = [this.$elemBeingDragged, this.objectBeingDragged], a = _ref[0], b = _ref[1];
        this.$elemBeingDragged.remove();
        delete this.$elemBeingDragged;
        delete this.objectBeingDragged;
        return [a, b];
      },
      positionDragHelper: function(evt) {
        var x, y;
        x = evt.pageX - this.dragOffset.x;
        y = evt.pageY - this.dragOffset.y;
        return this.$elemBeingDragged.css('top', "" + y + "px").css('left', "" + x + "px");
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
      _populateSidebar: function() {
        var core, dragStarted, elems, evtns, imageCollection, spriteCollection,
          _this = this;
        core = this;
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
        dragStarted = false;
        this.dragOffset = null;
        this.$elemBeingDragged = null;
        this.objectBeingDragged = null;
        elems = [];
        $.v.each(this.objects, function(so) {
          var $elem;
          $elem = so.$elem = $("<div/>").addClass('img').data('name', so.object.name).width(so.dims.w).height(so.dims.h).append(so.image.getElement());
          $elem.data('so', so);
          _this.$sidebar.find('> div[data-layer=tiles]').append($elem);
          return elems.push($elem[0]);
        });
        evtns = 'editor.core.sidebar';
        return $(elems).dragObject({
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
      },
      _chooseMap: function(mapName) {
        var map;
        if (this.currentMap) {
          this.currentMap.detach();
          this.currentMap.unload();
        } else {
          this.$layerChooser.attr('disabled', '');
        }
        map = require('game.mapCollection').get(mapName);
        map.setParent(this.viewport);
        map.load();
        map.attach();
        this.viewport.setMap(map);
        return this.currentLayer = 'foreground';
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
        var evtNamespace,
          _this = this;
        evtNamespace = 'editor.core.tools';
        this._destroyTools();
        $.v.each(tools, function(tool) {
          var $tool;
          $tool = $("<img src=\"/images/editor/tool-" + tool + ".gif\" data-tool=\"" + tool + "\">");
          return _this.$toolbox.append($tool);
        });
        this.$toolbox.find('> img').bind("click." + evtNamespace, function() {
          var tool;
          tool = $(_this).data('tool');
          return _this._selectTool(tool);
        });
        this._selectTool('normal');
        if ($.includes(tools, 'hand')) return this._initHandTool();
      },
      _destroyTools: function() {
        var evtNamespace;
        evtNamespace = 'editor.core.tools';
        this.$toolbox.find('> img').unbind('.' + evtNamespace);
        $(window).unbind('.' + evtNamespace);
        return this.$toolbox.html("");
      },
      _initHandTool: function() {
        var CTRL_KEY, SHIFT_KEY, evtNamespace, mouse,
          _this = this;
        evtNamespace = 'editor.core.tools';
        SHIFT_KEY = 16;
        CTRL_KEY = 17;
        mouse = {};
        return $(window).bind("keydown." + evtNamespace, function(evt) {
          if (evt.keyCode === SHIFT_KEY) {
            _this.prevTool = _this.currentTool;
            _this._selectTool('hand');
            return evt.preventDefault();
          }
        }).bind("keyup." + evtNamespace, function(evt) {
          if (evt.keyCode === SHIFT_KEY) {
            _this._selectTool(_this.prevTool);
            return _this.prevTool = null;
          }
        }).bind("mousemove." + evtNamespace, function(evt) {
          mouse.x = evt.pageX;
          return mouse.y = evt.pageY;
        });
      },
      _selectTool: function(tool) {
        var $tool, _name, _name2, _name3, _name4;
        $tool = this.$toolbox.find("> [data-tool='" + tool + "']");
        this.$toolbox.find('> img').removeClass('editor-active');
        $tool.addClass('editor-active');
        this.viewport.$element.removeClassesLike(/^editor-tool-/).addClass("editor-tool-" + tool);
        if (this.currentTool) {
          if (typeof this[_name = "_deactivate_" + this.currentLayer + "_" + this.currentTool + "_tool"] === "function") {
            this[_name]();
          }
          if (typeof this[_name2 = "_deactivate_" + this.currentTool + "_tool"] === "function") {
            this[_name2]();
          }
        }
        this.currentTool = tool;
        if (typeof this[_name3 = "_activate_" + this.currentLayer + "_" + this.currentTool + "_tool"] === "function") {
          this[_name3]();
        }
        return typeof this[_name4 = "_activate_" + this.currentTool + "_tool"] === "function" ? this[_name4]() : void 0;
      },
      _activate_fill_layer: function() {
        console.log('core: activating fill layer');
        return this._initTools(['normal', 'hand', 'select', 'bucket']);
      },
      _activate_tiles_layer: function() {
        console.log('core: activating tiles layer');
        return this._initTools(['normal', 'hand']);
      },
      _activate_tiles_normal_tool: function() {
        console.log('core: activating normal tool (layer: tiles)');
        return this.viewport.activate_tiles_normal_tool();
      },
      _deactivate_tiles_normal_tool: function() {
        console.log('core: deactivating normal tool (layer: tiles)');
        return this.viewport.deactivate_tiles_normal_tool();
      },
      _activate_tiles_hand_tool: function() {
        console.log('core: activating hand tool (layer: tiles)');
        return this.viewport.activate_tiles_hand_tool();
      },
      _deactivate_tiles_hand_tool: function() {
        console.log('core: deactivating hand tool (layer: tiles)');
        return this.viewport.deactivate_tiles_hand_tool();
      }
    });
  });

}).call(this);

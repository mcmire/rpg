(function() {

  define('editor.core', function() {
    var meta, util;
    meta = require('meta');
    util = require('util');
    meta.def({
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
            that.$layerChooser[0].selectedIndex = 0;
            return that.$layerChooser.change();
          },
          choose: function(layer) {
            var $layer, $map;
            if (this.current) {
              if (this.current === 'fill') {
                this.deactivateFillLayer();
              } else if (this.current === 'tiles') {
                this.deactivateTilesLayer();
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
            if (this.current === 'fill') {
              return this._activateFillLayer();
            } else if (this.current === 'tiles') {
              return this._activateTilesLayer();
            }
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
        this.layers.init();
        this.$mapChooser = $('#editor-map-chooser select');
        this._resizeUI();
        $(window).resize(function() {
          return _this._resizeUI();
        });
        this._loadImages();
        return this._whenImagesLoaded(function() {
          _this._populateSidebar();
          _this.viewport.loadMap();
          return _this._initToolbox();
        });
      },
      getLayers: function() {
        return this.layers.names;
      },
      getCurrentLayer: function() {
        return this.layers.current;
      },
      getCurrentLayerElem: function() {
        return this.viewport.$map.find(".editor-layer[data-layer=" + this.layers.current + "]");
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
        var dragStarted, imageCollection, spriteCollection,
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
        dragStarted = false;
        this.dragOffset = null;
        this.$elemBeingDragged = null;
        this.objectBeingDragged = null;
        return $.v.each(this.objects, function(so) {
          var $div;
          $div = so.$elem = $("<div/>").addClass('img').data('name', so.object.name).width(so.dims.w).height(so.dims.h).append(so.image.getElement()).bind('mousedown.editor.core', function(evt) {
            if (evt.button === 2) return;
            evt.preventDefault();
            $(window).bind('mousemove.editor.core', function(evt) {
              if (!dragStarted) {
                $div.trigger('mousedragstart.editor.core', evt);
                dragStarted = true;
              }
              if (_this.$elemBeingDragged) {
                return _this.positionDragHelper(evt);
              } else {

              }
            });
            return $(window).one('mouseup.editor.core', function(evt) {
              console.log('core mouseup');
              if (dragStarted) $div.trigger('mousedragend.editor.core', evt);
              $(window).unbind('mousemove.editor.core');
              dragStarted = false;
              _this.dragOffset = null;
              return true;
            });
          }).bind('mousedragstart.editor.core', function(evt) {
            var $elemBeingDragged, offset;
            console.log('core mousedragstart');
            $elemBeingDragged = $($div[0].cloneNode(true)).addClass('editor-map-object').addClass('editor-drag-helper').removeClass('img');
            _this.rememberDragObject([$elemBeingDragged, so]);
            $(document.body).addClass('editor-drag-active');
            offset = $div.offset();
            _this.dragOffset = {
              x: evt.pageX - offset.left,
              y: evt.pageY - offset.top
            };
            return _this.viewport.bindDragEvents();
          }).bind('mousedragend.editor.core', function(evt) {
            console.log('core mousedragend');
            _this.viewport.unbindDragEvents();
            $(document.body).removeClass('editor-drag-active');
            if (_this.$elemBeingDragged) return _this.forgetDragObject();
          });
          return _this.$sidebar.find('> div[data-layer=tiles]').append($div);
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
      _chooseLayer: function(layerName) {
        this.currentMap[this.currentLayer].deactivate();
        return this.currentMap[layerName].activate();
      },
      _initToolbox: function() {
        var $tools, CTRL_KEY, SHIFT_KEY, mouse, prevTool, selectTool, that, tools,
          _this = this;
        that = this;
        this.$toolbox = $('<div id="editor-toolbox"/>');
        this.viewport.$element.append(this.$toolbox);
        this.currentTool = null;
        prevTool = null;
        selectTool = function(tool) {
          var $tool;
          $tool = _this.$toolbox.find("> [data-tool='" + tool + "']");
          $tools.removeClass('editor-active');
          $tool.addClass('editor-active');
          _this.viewport.$element.removeClassesLike(/^editor-tool-/).addClass("editor-tool-" + tool);
          if (_this.currentTool === 'normal') _this._deactivateNormalTool();
          if (_this.currentTool === 'hand') _this._deactivateHandTool();
          _this.currentTool = tool;
          if (_this.currentTool === 'normal') _this._activateNormalTool();
          if (_this.currentTool === 'hand') return _this._activateHandTool();
        };
        tools = 'normal hand select bucket'.split(" ");
        $.v.each(tools, function(tool) {
          var $tool;
          $tool = $("<img src=\"/images/editor/tool-" + tool + ".gif\" data-tool=\"" + tool + "\">");
          return _this.$toolbox.append($tool);
        });
        $tools = this.$toolbox.find('> img').bind('click.editor', function() {
          var tool;
          tool = $(this).data('tool');
          return selectTool(tool);
        });
        selectTool('normal');
        SHIFT_KEY = 16;
        CTRL_KEY = 17;
        mouse = {};
        return $(window).bind('keydown.editor.core', function(evt) {
          if (evt.keyCode === SHIFT_KEY) {
            prevTool = _this.currentTool;
            selectTool('hand');
            return evt.preventDefault();
          }
        }).bind('keyup.editor.core', function(evt) {
          if (evt.keyCode === SHIFT_KEY) {
            selectTool(prevTool);
            return prevTool = null;
          }
        }).bind('mousemove.editor.core', function(evt) {
          mouse.x = evt.pageX;
          return mouse.y = evt.pageY;
        });
      }
    });
    return {
      _activateNormalTool: function() {
        return this.viewport.activateNormalTool();
      },
      _deactivateNormalTool: function() {
        return this.viewport.deactivateNormalTool();
      },
      _activateHandTool: function() {
        return this.viewport.activateHandTool();
      },
      _deactivateHandTool: function() {
        return this.viewport.deactivateHandTool();
      },
      _activateFillLayer: function() {},
      _activateTilesLayer: function() {}
    };
  });

}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  define('editor.viewport', function() {
    var GRID_SIZE, meta, util, viewport;
    util = require('util');
    meta = require('meta');
    require('editor.DropTarget');
    GRID_SIZE = 16;
    viewport = meta.def({
      init: function(core) {
        this.core = core;
        this.keyboard = this.core.keyboard;
        this.$elem = $('#editor-viewport');
        this.$map = $('#editor-map');
        this.$overlay = $('#editor-viewport-overlay');
        this._initMapGrid();
        this.$mapLayers = $('#editor-map-layers');
        this._initBounds();
        this.map = null;
        this.objectId = 0;
        this.objectsByLayer = $.v.reduce(this.core.getLayers(), (function(h, n) {
          h[n] = {};
          return h;
        }), {});
        return this;
      },
      getElement: function() {
        return this.$elem;
      },
      getMapLayers: function() {
        return this.$mapLayers;
      },
      getCurrentLayer: function() {
        return this.core.getCurrentLayer();
      },
      getElementForLayer: function(layer) {
        return this.$mapLayers.find(".editor-layer[data-layer=" + layer + "]");
      },
      getElementForCurrentLayer: function() {
        return this.getElementForLayer(this.getCurrentLayer());
      },
      getContentForLayer: function(layer) {
        return this.getElementForLayer(layer).find('.editor-layer-content');
      },
      getContentForCurrentLayer: function() {
        return this.getContentForLayer(this.getCurrentLayer());
      },
      getCurrentTool: function() {
        return this.core.getCurrentTool();
      },
      setWidth: function(width) {
        this.$elem.width(width);
        return this.bounds.setWidth(width);
      },
      setHeight: function(height) {
        this.$elem.height(height);
        return this.bounds.setHeight(height);
      },
      addLayer: function(layer) {
        var $layer;
        $layer = $("<div class=\"editor-layer\" data-layer=\"" + layer + "\">\n  <div class=\"editor-layer-bg\"></div>\n  <div class=\"editor-layer-content\"></div>\n</div>");
        return this.$mapLayers.append($layer);
      },
      loadMap: function() {
        var data, fill, layer, layers, _i, _j, _len, _len2, _ref, _ref2, _results,
          _this = this;
        this.map = require('game.Bounds').rect(0, 0, 1024, 1024);
        this.$map.removeClass('editor-map-unloaded').size({
          w: this.map.width,
          h: this.map.height
        });
        if (data = localStorage.getItem('editor.map')) {
          console.log({
            'map data': data
          });
          try {
            layers = JSON.parse(data);
            _ref = ['tiles'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              layer = _ref[_i];
              $.v.each(layers[layer], function(o) {
                var $elem, object;
                object = _this.core.objectsByName[o.name];
                $elem = object.$elem.clone();
                $elem.addClass('editor-map-object');
                $elem.css('left', "" + o.x + "px");
                $elem.css('top', "" + o.y + "px");
                _this.getContentForLayer(layer).append($elem);
                return _this.addObject(layer, $elem, object);
              });
            }
            _ref2 = layers['fill'];
            _results = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              fill = _ref2[_j];
              _results.push(this._loadFill(fill));
            }
            return _results;
          } catch (e) {
            console.warn("Had a problem loading the map!");
            throw e;
          }
        }
      },
      activate_tiles_normal_tool: function() {
        var evtns, layerSel, mapObjectsSel,
          _this = this;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        viewport = this;
        layerSel = '#editor-map .editor-layer[data-layer=tiles]';
        mapObjectsSel = "" + layerSel + " .editor-map-object";
        this.$elem.dropTarget({
          receptor: "" + layerSel + " .editor-layer-content"
        }).bind("mousedropwithin." + evtns, function(evt) {
          var $dragOwner, $draggee, dragObject;
          console.log("" + evtns + ": mousedropwithin");
          dragObject = evt.relatedObject;
          $dragOwner = dragObject.getElement();
          $draggee = dragObject.getDraggee();
          if (!_this.objectExistsIn('tiles', $draggee)) {
            _this.addObject('tiles', $draggee, $dragOwner.data('so'));
            _this._addEventsToMapObjects($draggee);
          }
          $draggee.position(_this._roundCoordsToGrid($draggee.position()));
          return _this.saveMap();
        });
        this._addEventsToMapObjects($(mapObjectsSel));
        this.$map.bind("mousedown." + evtns, function(evt) {
          console.log("" + evtns + ": mouseup");
          _this.$map.find('.editor-map-object').removeClass('editor-selected');
          return _this.$map.find('.editor-map-object[data-is-selected=yes]').addClass('editor-selected').attr('data-is-selected', 'no');
        });
        return $(window).bind("keyup." + evtns, function(evt) {
          var $selectedObjects;
          if (_this.keyboard.isKeyPressed(evt, 'backspace', 'delete')) {
            $selectedObjects = _this.$map.find('.editor-map-object.editor-selected');
            if ($selectedObjects.length) {
              $selectedObjects.each(function(elem) {
                var $elem, objectId;
                $elem = $(elem);
                objectId = $elem.data('moid');
                console.log("viewport: removing object " + objectId);
                delete _this.objectsByLayer[_this.core.getCurrentLayer()][objectId];
                return $elem.remove();
              });
              return _this.saveMap();
            }
          }
        });
      },
      deactivate_tiles_normal_tool: function() {
        var evtns, layerSel, mapObjectsSel;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        layerSel = '#editor-map .editor-layer[data-layer=tiles]';
        mapObjectsSel = "" + layerSel + " .editor-map-object";
        this.$elem.dropTarget('destroy').unbind("." + evtns);
        this._removeEventsFromMapObjects($(mapObjectsSel));
        this.$map.unbind("." + evtns);
        return $(window).unbind("." + evtns);
      },
      activate_hand_tool: function() {
        var dragActive, evtns,
          _this = this;
        evtns = 'editor.viewport.tool-hand';
        dragActive = false;
        return this.$elem.bind("mousedown." + evtns, function(evt) {
          var mouse;
          console.log('viewport: mousedown (hand tool)');
          if (evt.button === 2) return;
          mouse = {
            px: evt.pageX,
            py: evt.pageY
          };
          evt.preventDefault();
          $(window).bind("mousemove." + evtns, function(evt) {
            var dx, dy, h, mapX, mapY, w, x, y;
            if (!dragActive) {
              $(document.body).addClass('editor-drag-active');
              dragActive = true;
            }
            x = evt.pageX;
            y = evt.pageY;
            dx = x - mouse.px;
            dy = y - mouse.py;
            mapX = _this.map.x1 + dx;
            if (mapX > 0) mapX = 0;
            w = -(_this.map.width - _this.bounds.width);
            if (mapX < w) mapX = w;
            mapY = _this.map.y1 + dy;
            if (mapY > 0) mapY = 0;
            h = -(_this.map.height - _this.bounds.height);
            if (mapY < h) mapY = h;
            _this.$map.css("left", "" + mapX + "px");
            _this.$map.css("top", "" + mapY + "px");
            _this.map.anchor(mapX, mapY);
            mouse.px = x;
            mouse.py = y;
            return evt.preventDefault();
          });
          return $(window).one("mouseup." + evtns, function(evt) {
            $(document.body).removeClass('editor-drag-active');
            dragActive = false;
            mouse = null;
            return $(window).unbind("mousemove." + evtns);
          });
        });
      },
      deactivate_hand_tool: function() {
        var evtns;
        evtns = 'editor.viewport.tool-hand';
        this.$elem.unbind("." + evtns);
        return $(window).unbind("." + evtns);
      },
      activate_fill_normal_tool: function() {
        var $boxes, evtns,
          _this = this;
        evtns = 'editor.viewport.layer-fill.tool-normal';
        this.$elem.dropTarget({
          receptor: this.getElementForCurrentLayer()
        }).bind("mousedropwithin." + evtns, function(evt) {
          var $draggee, fill;
          $draggee = $(evt.relatedTarget);
          fill = $draggee.data('fill');
          fill.position(_this._roundCoordsToGrid($draggee.position()));
          return _this.saveMap();
        });
        $boxes = this.getContentForCurrentLayer().find('.editor-fill');
        this._addEventsToSelectionBoxes($boxes);
        return this.$elem.bind("mousedown." + evtns, function(evt) {
          var $layer;
          console.log("" + evtns + ": mousedown");
          $layer = _this.getContentForCurrentLayer();
          $layer.find('.editor-fill').trigger('unselect').removeClass('editor-selected');
          return $layer.find('.editor-fill[data-is-selected=yes]').trigger('select').addClass('editor-selected').attr('data-is-selected', 'no');
        });
      },
      deactivate_fill_normal_tool: function() {
        var $boxes, evtns;
        evtns = 'editor.viewport.layer-fill.tool-normal';
        this.$elem.unbind("." + evtns);
        this.$elem.dropTarget('destroy');
        $boxes = this.getContentForCurrentLayer().find('.editor-fill');
        return this._removeEventsFromSelectionBoxes($boxes);
      },
      activate_fill_select_tool: function() {
        var activeSelections, adjustCoords, clearActiveSelections, currentSelection, dragStarted, evtns, mouseDownAt, selectionEvents,
          _this = this;
        evtns = 'editor.viewport.layer-fill.tool-select';
        dragStarted = false;
        mouseDownAt = null;
        activeSelections = [];
        currentSelection = null;
        clearActiveSelections = function() {
          activeSelections = [];
          return _this.$overlay.find('.editor-selection-box').remove();
        };
        selectionEvents = (function() {
          var clearSelection, ex, mouseupBound;
          mouseupBound = false;
          clearSelection = function(evt) {
            console.log('clearing selection');
            evt.preventDefault();
            return clearActiveSelections();
          };
          ex = {};
          ex.add = function() {
            if (mouseupBound) return;
            console.log('binding mouseup');
            mouseupBound = true;
            return _this.$elem.bind("mouseup." + evtns, clearSelection);
          };
          ex.remove = function() {
            if (!mouseupBound) return;
            console.log('unbinding mouseup');
            mouseupBound = false;
            return _this.$elem.unbind(clearSelection);
          };
          return ex;
        })();
        adjustCoords = function(p) {
          return {
            x: p.x - _this.bounds.x1,
            y: p.y - _this.bounds.y1
          };
        };
        this.$elem.bind("contextmenu." + evtns, function(evt) {
          return evt.preventDefault();
        }).bind("mousedown." + evtns, function(evt) {
          var appendingNewSelection, selectionStartedAt;
          if (evt.button === 2 || (evt.ctrlKey && evt.button === 0)) return;
          evt.preventDefault();
          appendingNewSelection = evt.altKey;
          selectionStartedAt = _this._roundCoordsToGrid(adjustCoords({
            x: evt.pageX,
            y: evt.pageY
          }));
          return _this.$elem.bind("mousemove." + evtns, function(evt) {
            var $box, h, mouse, w, x, y;
            evt.preventDefault();
            if (!dragStarted) {
              dragStarted = true;
              if (!appendingNewSelection) clearActiveSelections();
              selectionEvents.remove();
              currentSelection = {};
              currentSelection.pos = selectionStartedAt;
              currentSelection.$box = $box = $('<div class="editor-selection-box">');
              _this.$overlay.append(currentSelection.$box);
            }
            mouse = _this._roundCoordsToGrid(adjustCoords({
              x: evt.pageX,
              y: evt.pageY
            }));
            if (mouse.x < currentSelection.pos.x) {
              x = mouse.x;
              w = currentSelection.pos.x - mouse.x;
            } else {
              x = currentSelection.pos.x;
              w = mouse.x - currentSelection.pos.x;
            }
            if (mouse.y < currentSelection.pos.y) {
              y = mouse.y;
              h = currentSelection.pos.y - mouse.y;
            } else {
              y = currentSelection.pos.y;
              h = mouse.y - currentSelection.pos.y;
            }
            $.extend(currentSelection, {
              x: x,
              y: y,
              w: w,
              h: h
            });
            if (w === 0 && h === 0) {
              return currentSelection.$box.hide();
            } else {
              return currentSelection.$box.show().moveTo({
                x: x,
                y: y
              }).size({
                w: w - 1,
                h: h - 1
              });
            }
          });
        }).delegate('.editor-selection-box', "mousedown." + evtns, function(evt) {
          console.log('selection box mousedown');
          evt.preventDefault();
          return selectionEvents.remove();
        }).delegate('.editor-selection-box', "mouseup." + evtns, function(evt) {
          console.log('selection box mouseup');
          evt.preventDefault();
          return setTimeout(selectionEvents.add, 0);
        });
        $(window).bind("mouseup." + evtns, function(evt) {
          _this.$elem.unbind("mousemove." + evtns);
          mouseDownAt = null;
          if (currentSelection && currentSelection.w > 0 && currentSelection.h > 0) {
            activeSelections.push(currentSelection);
          }
          currentSelection = null;
          dragStarted = false;
          return setTimeout(selectionEvents.add, 0);
        }).bind("keyup." + evtns, function(evt) {
          var Bounds;
          Bounds = require('game.Bounds');
          if (_this.keyboard.isKeyPressed(evt, 'F')) {
            $.v.each(activeSelections, function(sel) {
              var fill;
              fill = {
                x: sel.x,
                y: sel.y,
                w: sel.w,
                h: sel.h,
                color: '#800000'
              };
              return _this._loadFill(fill);
            });
            return _this.saveMap();
          }
        });
        return selectionEvents.add();
      },
      _addEventsToSelectionBoxes: function($boxes) {
        var evtns, that;
        that = this;
        evtns = 'editor.viewport.selection-box';
        return $boxes.dragObject({
          dropTarget: this.$elem,
          containWithinDropTarget: true
        }).bind("mousedown." + evtns, function(evt) {
          var $this, newstate, state;
          console.log('selection box mousedown (after creation)');
          $this = $(this);
          state = $this.attr('data-is-selected');
          newstate = state === 'no' || !state ? 'yes' : 'no';
          return $this.attr('data-is-selected', newstate);
        }).bind('select', function(evt) {
          var $input, $this, fill;
          $this = $(this);
          if ($this.hasClass('editor-selected')) return;
          fill = $this.data('fill');
          console.log("selecting fill " + fill.moid);
          $(window).bind("keyup." + evtns, function(evt) {
            var $layerContent, $selectedObjects;
            if (that.keyboard.isKeyPressed(evt, 'backspace', 'delete')) {
              $layerContent = that.getContentForCurrentLayer();
              $selectedObjects = $layerContent.find('.editor-fill.editor-selected');
              if ($selectedObjects.length) {
                $selectedObjects.each(function(elem) {
                  return that._removeFill(elem);
                });
                return that.saveMap();
              }
            }
          });
          $input = $('<input>');
          $input.attr('value', fill.store.color);
          $input.bind('focus', function() {
            return that._unbindGlobalKeyEvents();
          }).bind('blur', function() {
            return that._rebindGlobalKeyEvents();
          }).bind('keyup', function() {
            if (/#[A-Fa-f]/.test(this.value)) {
              fill.fill(this.value);
              return that.saveMap();
            }
          });
          return that.core.getToolDetailElement().html("").append("Fill background: ").append($input);
        }).bind('unselect', function() {
          var $elem, $this, fill;
          $this = $(this);
          if (!$this.hasClass('editor-selected')) return;
          fill = $this.data('fill');
          console.log("unselecting fill " + fill.moid);
          $(window).unbind("keyup." + evtns);
          $elem = that.core.getToolDetailElement();
          $elem.find('input').unbind('change');
          return $elem.html("");
        });
      },
      _removeEventsFromSelectionBoxes: function($boxes) {
        var evtns;
        evtns = 'editor.viewport.selection-box';
        $boxes.dragObject('destroy').unbind("mousedown." + evtns + " select unselect").attr('data-is-selected', 'no').removeClass('editor-selected');
        return $(window).unbind("keyup." + evtns);
      },
      deactivate_fill_select_tool: function() {
        var evtns;
        evtns = 'editor.viewport.layer-fill.tool-select';
        this.$elem.unbind("." + evtns);
        return $(window).unbind("." + evtns);
      },
      addObject: function(layer, $elem, object) {
        var k, obj, v, _name;
        console.log('viewport: addObject');
        obj = {};
        obj.moid = this.objectId;
        for (k in object) {
          if (!__hasProp.call(object, k)) continue;
          v = object[k];
          obj[k] = v;
        }
        obj.$elem = $elem;
        $elem.data('moid', this.objectId);
        console.log({
          adding: obj
        });
        this.objectsByLayer[layer][this.objectId] = obj;
        this.objectId++;
        return typeof this[_name = "_activate_" + layer + "_" + this.core.currentTool + "_tool_for_object"] === "function" ? this[_name](obj) : void 0;
      },
      objectExistsIn: function(layer, $elem) {
        var moid;
        moid = $elem.data('moid');
        return !!this.objectsByLayer[layer][moid];
      },
      _createFillElement: function(fill) {
        var $elem;
        $elem = $('<div class="editor-fill"></div>');
        $elem.position(fill.store);
        $elem.size(fill.store);
        $elem.css('background-color', fill.store.color);
        $elem.data('fill', fill);
        return $elem;
      },
      _createFill: function(store) {
        var $elem, fill;
        fill = {
          store: util.dup(store)
        };
        fill.position = function(pos) {
          if (pos) {
            this.$elem.position(pos);
            this.store.x = pos.x;
            this.store.y = pos.y;
            return this;
          } else {
            return {
              x: this.store.x,
              y: this.store.y
            };
          }
        };
        fill.fill = function(color) {
          if (color) {
            this.$elem.css('background-color', this.color);
            return this.store.color = color;
          } else {
            return this.store.color;
          }
        };
        $elem = this._createFillElement(fill);
        fill.$elem = $elem;
        fill.moid = this.objectId;
        this.objectId++;
        return fill;
      },
      _addFill: function(fill) {
        return this.objectsByLayer['fill'][fill.moid] = fill;
      },
      _loadFill: function(fill) {
        var $content;
        fill = this._createFill(fill);
        $content = this.getContentForLayer('fill');
        if (!$content.length) {
          throw new Error("Can't add fill, couldn't find layer content element");
        }
        $content.append(fill.$elem);
        this._addFill(fill);
        return fill;
      },
      _removeFill: function(elem) {
        var $elem, fill;
        $elem = $(elem);
        fill = $elem.data('fill');
        console.log("viewport: removing fill " + fill.moid);
        delete this.objectsByLayer['fill'][fill.moid];
        return $elem.remove();
      },
      saveMap: function() {
        var id, layer, layers, object, pos, _i, _len, _ref, _ref2;
        console.log('viewport: saving map...');
        layers = {};
        _ref = ['tiles'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          layers[layer] = [];
          _ref2 = this.objectsByLayer[layer];
          for (id in _ref2) {
            object = _ref2[id];
            pos = object.$elem.position();
            layers[layer].push({
              name: object.name,
              x: pos.x,
              y: pos.y
            });
          }
        }
        layers['fill'] = $.v.map(this.objectsByLayer['fill'], function(moid, fill) {
          return fill.store;
        });
        return localStorage.setItem('editor.map', JSON.stringify(layers));
      },
      _initMapGrid: function() {
        var canvas, ctx, mapGrid;
        canvas = require('game.canvas').create(GRID_SIZE, GRID_SIZE);
        ctx = canvas.getContext();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(GRID_SIZE, 0.5);
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(0.5, GRID_SIZE);
        ctx.stroke();
        mapGrid = canvas;
        return this.$mapGrid = $('#editor-map-grid').css('background-image', "url(" + (mapGrid.element.toDataURL()) + ")").css('background-repeat', 'repeat');
      },
      _initBounds: function() {
        var offset;
        offset = this.$elem.offset();
        return this.bounds = require('game.Bounds').rect(offset.left, offset.top, offset.width, offset.height);
      },
      _addEventsToMapObjects: function($draggees) {
        var evtns;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        $draggees.bind("mousedown." + evtns, function(evt) {
          var $draggee, newstate, state;
          console.log("" + evtns + ": map object mouseupnodrag");
          $draggee = $(this);
          state = $draggee.attr('data-is-selected');
          newstate = state === 'no' || !state ? 'yes' : 'no';
          return $draggee.attr('data-is-selected', newstate);
        });
        return $draggees.dragObject({
          dropTarget: this.$elem,
          containWithinDropTarget: true
        });
      },
      _removeEventsFromMapObjects: function($draggees) {
        var evtns;
        evtns = 'editor.viewport.layer-tiles.tool-normal';
        return $draggees.dragObject('destroy').unbind("." + evtns);
      },
      _roundCoordsToGrid: function(p) {
        return {
          x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(p.y / GRID_SIZE) * GRID_SIZE
        };
      },
      _mouseWithinViewport: function(evt) {
        var _ref, _ref2;
        return (this.bounds.x1 <= (_ref = evt.pageX) && _ref <= this.bounds.x2) && (this.bounds.y1 <= (_ref2 = evt.pageY) && _ref2 <= this.bounds.y2);
      }
    });
    (function() {
      var tmp;
      tmp = {};
      viewport._unbindGlobalKeyEvents = function() {
        var events;
        console.log('removing global key events');
        events = 'keyup keydown';
        $(tmp).cloneEvents(window, events);
        $(window).unbind(events);
        return console.log(tmp);
      };
      return viewport._rebindGlobalKeyEvents = function() {
        var events;
        console.log('restoring global key events');
        events = 'keyup keydown';
        return $(window).cloneEvents(tmp, events);
      };
    })();
    return viewport;
  });

}).call(this);

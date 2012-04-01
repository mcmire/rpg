(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  define('editor.viewport', function() {
    var GRID_SIZE, meta;
    meta = require('meta');
    require('editor.DropTarget');
    GRID_SIZE = 16;
    return meta.def({
      init: function(core) {
        this.core = core;
        this.keyboard = this.core.keyboard;
        this.$elem = $('#editor-viewport');
        this.$map = $('#editor-map');
        this._initMapGrid();
        this.$mapLayers = $('#editor-map-layers');
        this._initBounds();
        this.map = null;
        this.objectsByLayer = $.v.reduce(this.core.getLayers(), (function(h, n) {
          h[n] = {};
          return h;
        }), {});
        this.objectId = 0;
        return this;
      },
      getElement: function() {
        return this.$elem;
      },
      getMapLayers: function() {
        return this.$mapLayers;
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
        var data, objectsByLayer,
          _this = this;
        this.map = require('game.Bounds').rect(0, 0, 1024, 1024);
        this.$map.removeClass('editor-map-unloaded').size({
          w: this.map.width,
          h: this.map.height
        });
        if (data = localStorage.getItem('editor.map')) {
          try {
            objectsByLayer = JSON.parse(data);
            console.log({
              'map data': data
            });
            return $.v.each(objectsByLayer, function(layer, objects) {
              return $.v.each(objects, function(o) {
                var $elem, object;
                object = _this.core.objectsByName[o.name];
                $elem = object.$elem.clone();
                $elem.addClass('editor-map-object');
                $elem.css('left', "" + o.x + "px");
                $elem.css('top', "" + o.y + "px");
                _this.core.findLayer(layer).find('.editor-layer-content').append($elem);
                return _this.addObject(layer, $elem, object);
              });
            });
          } catch (e) {
            console.warn("Had a problem loading the map!");
            throw e;
          }
        }
      },
      activate_tiles_normal_tool: function() {
        var evtns, layerSel, mapObjectsSel, viewport,
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
        this.$map.bind("mouseup." + evtns, function(evt) {
          console.log("" + evtns + ": mouseup");
          _this.$map.find('.editor-map-object').removeClass('editor-selected');
          return _this.$map.find('.editor-map-object[data-is-selected=yes]').addClass('editor-selected').removeAttr('data-is-selected');
        });
        return $(window).bind("keydown." + evtns, function(evt) {
          var $selectedObjects;
          if (_this.keyboard.isKeyPressed(evt, 'backspace', 'delete')) {
            evt.preventDefault();
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
      activate_fill_select_tool: function() {
        var $layerElem, activeSelections, adjustCoords, clearActiveSelections, currentSelection, dragStarted, evtns, mouseDownAt, selectionEvents,
          _this = this;
        evtns = 'editor.viewport.layer-fill.tool-select';
        dragStarted = false;
        mouseDownAt = null;
        activeSelections = [];
        currentSelection = null;
        $layerElem = this.core.getCurrentLayerElem().find('.editor-layer-content');
        clearActiveSelections = function() {
          activeSelections = [];
          return $layerElem.find('.editor-selection-box').remove();
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
          var addNewSelection, selectionStartedAt;
          if (evt.button === 2 || (evt.ctrlKey && evt.button === 0)) return;
          evt.preventDefault();
          addNewSelection = evt.altKey;
          selectionStartedAt = _this._roundCoordsToGrid(adjustCoords({
            x: evt.pageX,
            y: evt.pageY
          }));
          return _this.$elem.bind("mousemove." + evtns, function(evt) {
            var h, mouse, w, x, y;
            evt.preventDefault();
            if (!dragStarted) {
              if (!addNewSelection) clearActiveSelections();
              selectionEvents.remove();
              currentSelection = {};
              currentSelection.pos = selectionStartedAt;
              currentSelection.$box = $('<div class="editor-selection-box">').appendTo($layerElem);
              activeSelections.push(currentSelection);
              dragStarted = true;
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
        }).bind("mouseup." + evtns, function(evt) {
          _this.$elem.unbind("mousemove." + evtns);
          mouseDownAt = null;
          currentSelection = null;
          dragStarted = false;
          return setTimeout(selectionEvents.add, 0);
        });
        return selectionEvents.add();
      },
      deactivate_fill_select_tool: function() {
        var evtns;
        evtns = 'editor.viewport.layer-fill.tool-select';
        return this.$elem.unbind("." + evtns);
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
      saveMap: function() {
        var data,
          _this = this;
        console.log('viewport: saving map...');
        data = $.v.reduce($.v.keys(this.objectsByLayer), function(hash, layer) {
          var arr;
          arr = $.v.map(_this.objectsByLayer[layer], function(id, object) {
            var pos;
            pos = object.$elem.position();
            return {
              name: object.name,
              x: pos.x,
              y: pos.y
            };
          });
          hash[layer] = arr;
          return hash;
        }, {});
        return localStorage.setItem('editor.map', JSON.stringify(data));
      },
      _initMapGrid: function() {
        var canvas, ctx, mapGrid;
        canvas = require('game.canvas').create(16, 16);
        ctx = canvas.getContext();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(16, 0.5);
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(0.5, 16);
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
        $draggees.bind("mouseupnodrag." + evtns, function(evt) {
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
  });

}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  define('editor.viewport', function() {
    var Bounds, GRID_SIZE, meta, util;
    meta = require('meta');
    util = require('util');
    Bounds = require('game.Bounds');
    require('editor.DropTarget');
    GRID_SIZE = 16;
    return meta.def({
      init: function(core) {
        this.core = core;
        this.$elem = $('#editor-viewport');
        this._initMapElement();
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
      setWidth: function(width) {
        this.$elem.width(width);
        return this.bounds.setWidth(width);
      },
      setHeight: function(height) {
        this.$elem.height(height);
        return this.bounds.setHeight(height);
      },
      loadMap: function() {
        var data, dragEntered, mouse, objectsByLayer,
          _this = this;
        this.map = Bounds.rect(0, 0, 1024, 1024);
        mouse = null;
        dragEntered = null;
        this.$elemBeingDragged = null;
        this.objectBeingDragged = null;
        this.$map.css('width', this.map.width).css('height', this.map.height).removeClass('editor-map-unloaded');
        localStorage.removeItem('editor.map');
        if (data = localStorage.getItem('editor.map')) {
          console.log({
            'map data': data
          });
          try {
            objectsByLayer = JSON.parse(data);
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
        var BACKSPACE_KEY, DELETE_KEY, evtns, layerSel, mapObjectsSel, viewport,
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
        BACKSPACE_KEY = 8;
        DELETE_KEY = 46;
        return $(window).bind("keydown." + evtns, function(evt) {
          var $selectedObjects;
          if (evt.keyCode === DELETE_KEY || evt.keyCode === BACKSPACE_KEY) {
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
        var evtns,
          _this = this;
        evtns = 'editor.viewport.tool-hand';
        return this.$map.bind("mousedown." + evtns, function(evt) {
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
            if (mouse) mouse = null;
            return $(window).unbind("mousemove." + evtns);
          });
        });
      },
      deactivate_hand_tool: function() {
        var evtns;
        evtns = 'editor.viewport.tool-hand';
        this.$map.unbind("." + evtns);
        return $(window).unbind("." + evtns);
      },
      activate_fill_select_tool: function() {
        var $layerElem, SELECTION_ACTIVATION_OFFSET, adjustCoords, bindMouseup, clearSelection, evtns, mouseDownAt, mouseupBound, selection, unbindMouseup,
          _this = this;
        evtns = 'editor.viewport.layer-fill.tool-select';
        mouseDownAt = null;
        selection = null;
        SELECTION_ACTIVATION_OFFSET = 4;
        $layerElem = this.core.getCurrentLayerElem().find('.editor-layer-content');
        clearSelection = function(evt) {
          console.log('clearing selection');
          evt.preventDefault();
          $layerElem.find('.editor-selection-box').remove();
          return selection = null;
        };
        mouseupBound = false;
        bindMouseup = function() {
          if (mouseupBound) return;
          console.log('binding mouseup');
          return mouseupBound = true;
        };
        unbindMouseup = function() {
          if (!mouseupBound) return;
          console.log('unbinding mouseup');
          return mouseupBound = false;
        };
        adjustCoords = function(p) {
          return {
            x: p.x - _this.bounds.x1,
            y: p.y - _this.bounds.y1
          };
        };
        this.$elem.bind("mousedown." + evtns, function(evt) {
          var mouse, pos;
          if (evt.button === 2) return;
          evt.preventDefault();
          mouse = mouseDownAt = {
            x: evt.pageX,
            y: evt.pageY
          };
          pos = _this._roundCoordsToGrid(adjustCoords(mouse));
          selection = {};
          selection.pos = pos;
          return _this.$elem.bind("mousemove." + evtns, function(evt) {
            var dragOffsetX, dragOffsetY, h, w, x, y;
            evt.preventDefault();
            mouse = {
              x: evt.pageX,
              y: evt.pageY
            };
            dragOffsetX = Math.abs(evt.pageX - mouseDownAt.x);
            dragOffsetY = Math.abs(evt.pageY - mouseDownAt.y);
            if (!(dragOffsetX > SELECTION_ACTIVATION_OFFSET || dragOffsetY > SELECTION_ACTIVATION_OFFSET)) {
              return;
            }
            unbindMouseup();
            if (!selection.isPresent) {
              selection.$box = $('<div class="editor-selection-box">').appendTo($layerElem);
              selection.isPresent = true;
            }
            mouse = _this._roundCoordsToGrid(adjustCoords(mouse));
            if (mouse.x < selection.pos.x) {
              x = mouse.x;
              w = selection.pos.x - mouse.x;
            } else {
              x = selection.pos.x;
              w = mouse.x - selection.pos.x;
            }
            if (mouse.y < selection.pos.y) {
              y = mouse.y;
              h = selection.pos.y - mouse.y;
            } else {
              y = selection.pos.y;
              h = mouse.y - selection.pos.y;
            }
            if (w === 0 && h === 0) {
              return selection.$box.hide();
            } else {
              return selection.$box.show().moveTo({
                x: x,
                y: y
              }).size({
                w: w,
                h: h
              });
            }
          });
        }).delegate('.editor-selection-box', "mouseup." + evtns, function(evt) {
          console.log('selection box mouseup');
          evt.stopPropagation();
          return evt.preventDefault();
        }).bind("mouseup." + evtns, function(evt) {
          _this.$elem.unbind("mousemove." + evtns);
          mouseDownAt = null;
          return setTimeout(bindMouseup, 0);
        });
        return bindMouseup();
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
            return {
              name: object.name,
              x: parseInt(object.$elem.css('left'), 10),
              y: parseInt(object.$elem.css('top'), 10)
            };
          });
          hash[layer] = arr;
          return hash;
        }, {});
        return localStorage.setItem('editor.map', JSON.stringify(data));
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
      },
      _initMapElement: function() {
        var $layer, i, layer, _len, _ref, _results;
        this.$map = $('#editor-map');
        _ref = this.core.getLayers();
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          layer = _ref[i];
          $layer = $("<div class=\"editor-layer\" data-layer=\"" + layer + "\">\n  <div class=\"editor-layer-bg\"></div>\n  <div class=\"editor-layer-content\"></div>\n</div>");
          $layer.css('z-index', (i + 1) * 10);
          _results.push(this.$map.append($layer));
        }
        return _results;
      },
      _initBounds: function() {
        var offset;
        offset = this.$elem.offset();
        return this.bounds = Bounds.rect(offset.left, offset.top, offset.width, offset.height);
      }
    });
  });

}).call(this);

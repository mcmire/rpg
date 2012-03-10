(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  define('editor.viewport', function() {
    var Bounds, DRAG_SNAP_GRID_SIZE, meta, util;
    meta = require('meta');
    util = require('util');
    Bounds = require('game.Bounds');
    DRAG_SNAP_GRID_SIZE = 16;
    return meta.def({
      init: function(core) {
        this.core = core;
        this.$element = $('#editor-viewport');
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
      setWidth: function(width) {
        this.$element.width(width);
        return this.bounds.setWidth(width);
      },
      setHeight: function(height) {
        this.$element.height(height);
        return this.bounds.setHeight(height);
      },
      rememberDragObject: function(_arg) {
        this.$elemBeingDragged = _arg[0], this.objectBeingDragged = _arg[1];
        return this.core.getCurrentLayerElem().find('.editor-layer-content').append(this.$elemBeingDragged);
      },
      forgetDragObject: function(removeElement) {
        var a, b, _ref;
        if (removeElement == null) removeElement = true;
        _ref = [this.$elemBeingDragged, this.objectBeingDragged], a = _ref[0], b = _ref[1];
        if (removeElement) this.$elemBeingDragged.remove();
        delete this.$elemBeingDragged;
        delete this.objectBeingDragged;
        return [a, b];
      },
      bindDragEvents: function() {
        var mouseLocation,
          _this = this;
        console.log('binding drag events to viewport');
        mouseLocation = null;
        $(window).bind('mousemove.editor.viewport', function(evt) {
          if (_this._mouseWithinViewport(evt)) {
            if (mouseLocation !== 'inside') {
              _this.$map.trigger('mousedragover.editor.viewport', evt);
              mouseLocation = 'inside';
            }
            return _this.$map.trigger('mousedrag.editor.viewport', evt);
          } else if (_this.$elemBeingDragged && mouseLocation !== 'outside') {
            _this.$map.trigger('mousedragout.editor.viewport', evt);
            return mouseLocation = 'outside';
          }
        });
        return this.$map.one('mouseup.editor.viewport', function(evt) {
          console.log('viewport mouseup');
          if (_this.$elemBeingDragged) {
            return _this.$map.trigger('mousedrop.editor.viewport', evt);
          }
        }).bind('mousedragover.editor.viewport', function(evt) {
          console.log('viewport mousedragover');
          _this.rememberDragObject(_this.core.forgetDragObject());
          return _this.$elemBeingDragged.removeClass('editor-drag-helper');
        }).bind('mousedrag.editor.viewport', function(evt) {
          var $elem, x, y;
          $elem = _this.$elemBeingDragged;
          x = evt.pageX - _this.core.dragOffset.x - _this.map.x1 - _this.bounds.x1;
          y = evt.pageY - _this.core.dragOffset.y - _this.map.y1 - _this.bounds.y1;
          return $elem.css('top', "" + y + "px").css('left', "" + x + "px");
        }).bind('mousedragout.editor.viewport', function(evt) {
          console.log('viewport mousedragout');
          _this.$elemBeingDragged.addClass('editor-drag-helper');
          _this.core.rememberDragObject(_this.forgetDragObject());
          return _this.core.positionDragHelper(evt);
        }).bind('mousedrop.editor.viewport', function(evt) {
          var $elem, x, y;
          console.log('viewport drop');
          $elem = _this.$elemBeingDragged;
          x = parseInt($elem.css('left'), 10);
          y = parseInt($elem.css('top'), 10);
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
          $elem.css('top', "" + y + "px").css('left', "" + x + "px");
          _this.addObject(_this.core.getCurrentLayer(), _this.$elemBeingDragged, _this.objectBeingDragged);
          _this.forgetDragObject(false);
          return _this.saveMap();
        });
      },
      unbindDragEvents: function() {
        console.log('removing drag events from viewport');
        $(window).unbind('mousemove.editor.viewport');
        this.$map.unbind('mousedragover.editor.viewport');
        this.$map.unbind('mousedrag.editor.viewport');
        this.$map.unbind('mousedragout.editor.viewport');
        return this.$map.unbind('mousedrop.editor.viewport');
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
        if (data = localStorage.getItem('editor.map')) {
          objectsByLayer = JSON.parse(data);
          return $.v.each(objectsByLayer, function(layer, objects) {
            return $.v.each(objects, function(o) {
              var $elem, elem, object;
              object = _this.core.objectsByName[o.name];
              elem = object.$elem[0].cloneNode(true);
              elem.removeAttribute('data-node-uid');
              $elem = $(elem);
              $elem.addClass('editor-map-object');
              $elem.css('left', "" + o.x + "px");
              $elem.css('top', "" + o.y + "px");
              _this.core.getCurrentLayerElem().find('.editor-layer-content').append($elem);
              return _this.addObject(layer, $elem, object);
            });
          });
        }
      },
      activateNormalTool: function() {
        var BACKSPACE_KEY, DELETE_KEY, selecteds,
          _this = this;
        selecteds = [];
        $.v.each(this.objectsByLayer['tiles'], function(id, obj) {
          return _this.activateNormalToolForObject(obj);
        });
        this.$map.bind('mouseup.editor.viewport.selection', function(evt) {
          console.log('map mouseup');
          _this.$map.find('.editor-map-object').removeClass('editor-selected');
          return _this.$map.find('.editor-map-object[data-is-selected=yes]').addClass('editor-selected');
        });
        BACKSPACE_KEY = 8;
        DELETE_KEY = 46;
        return $(window).bind('keydown.editor.viewport', function(evt) {
          if (evt.keyCode === DELETE_KEY || evt.keyCode === BACKSPACE_KEY) {
            evt.preventDefault();
            _this.$map.find('.editor-map-object.editor-selected').each(function(elem) {
              var $elem, objectId;
              $elem = $(elem);
              objectId = $elem.data('moid');
              console.log("removing object " + objectId);
              delete _this.objectsByLayer[_this.core.getCurrentLayer()][objectId];
              return $elem.remove();
            });
            return _this.saveMap();
          }
        });
      },
      activateNormalToolForObject: function(obj) {
        var $elem, dragOffset, dragStarted,
          _this = this;
        dragStarted = false;
        dragOffset = null;
        $elem = obj.$elem;
        return obj.$elem.unbind('.editor').removeClass('drag-helper').bind('mousedown.editor.viewport', function(evt) {
          console.log('map object mousedown');
          if (evt.button === 2) return;
          evt.stopPropagation();
          evt.preventDefault();
          $(window).bind('mousemove.editor.viewport', function(evt) {
            if (!dragStarted) {
              obj.$elem.trigger('mousedragstart.editor.viewport', evt);
              dragStarted = true;
            }
            return $elem.trigger('mousedrag.editor.viewport', evt);
          });
          return $(window).one('mouseup.editor.viewport', function(evt) {
            console.log('viewport mouseup');
            if (dragStarted) $elem.trigger('mousedragend.editor.viewport', evt);
            dragStarted = false;
            dragOffset = null;
            $(window).unbind('mousemove.editor.viewport');
            return true;
          });
        }).bind('mousedragstart.editor.viewport', function(evt) {
          var offset;
          console.log('map object mousedragstart');
          $(document.body).addClass('editor-drag-active');
          offset = $elem.offset();
          return dragOffset = {
            x: evt.pageX - offset.left,
            y: evt.pageY - offset.top
          };
        }).bind('mousedrag.editor.viewport', function(evt) {
          var x, y;
          x = evt.pageX - dragOffset.x - _this.map.x1 - _this.bounds.x1;
          y = evt.pageY - dragOffset.y - _this.map.y1 - _this.bounds.y1;
          return $elem.css('top', "" + y + "px").css('left', "" + x + "px");
        }).bind('mousedragend.editor.viewport', function(evt) {
          var x, y;
          console.log('map object mousedragend');
          $(document.body).removeClass('editor-drag-active');
          x = parseInt($elem.css('left'), 10);
          y = parseInt($elem.css('top'), 10);
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
          $elem.css('top', "" + y + "px").css('left', "" + x + "px");
          return _this.saveMap();
        }).bind('mouseup.editor.viewport.selection', function(evt) {
          var newstate, state;
          console.log('map object mouseup');
          if (!dragStarted) {
            state = $elem.attr('data-is-selected');
            newstate = state === 'no' || !state ? 'yes' : 'no';
            $elem.attr('data-is-selected', newstate);
          }
          return true;
        });
      },
      deactivateNormalTool: function() {
        $.v.each(this.objectsByLayer['tiles'], function(id, obj) {
          return obj.$elem.unbind('mousedown.editor.viewport').unbind('mousedragstart.editor.viewport').unbind('mousedrag.editor.viewport').unbind('mousedragend.editor.viewport');
        });
        return this.$map.unbind('mouseup.editor.viewport');
      },
      activateHandTool: function() {
        var $map,
          _this = this;
        $map = this.$map;
        return this.$map.bind('mousedown.editor.viewport', function(evt) {
          var mouse;
          if (evt.button === 2) return;
          mouse = {
            px: evt.pageX,
            py: evt.pageY
          };
          evt.preventDefault();
          $(window).bind('mousemove.editor.viewport', function(evt) {
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
            $map.css("left", "" + mapX + "px");
            $map.css("top", "" + mapY + "px");
            _this.map.anchor(mapX, mapY);
            mouse.px = x;
            mouse.py = y;
            return evt.preventDefault();
          });
          return $(window).one('mouseup.editor.viewport', function(evt) {
            if (mouse) mouse = null;
            return $(window).unbind('mousemove.editor.viewport');
          });
        });
      },
      deactivateHandTool: function() {
        return this.$map.unbind('mousedown.editor.viewport');
      },
      addObject: function(layer, $elem, object) {
        var k, obj, v;
        console.log('addObject');
        obj = {};
        obj.moid = this.objectId;
        for (k in object) {
          if (!__hasProp.call(object, k)) continue;
          v = object[k];
          obj[k] = v;
        }
        obj.$elem = $elem;
        $elem.data('moid', this.objectId);
        this.objectsByLayer[layer][this.objectId] = obj;
        if (this.core.currentTool === 'normal') {
          this.activateNormalToolForObject(obj);
        }
        return this.objectId++;
      },
      stealFrom: function(obj, prop) {
        return this[prop] = obj["delete"](prop);
      },
      giveTo: function(obj, prop) {
        return obj[prop] = this["delete"](prop);
      },
      "delete": function(prop) {
        var val;
        val = this[prop];
        delete this[prop];
        return val;
      },
      saveMap: function() {
        var data,
          _this = this;
        console.log('saving map...');
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
        offset = this.$element.offset();
        return this.bounds = Bounds.rect(offset.left, offset.top, offset.width, offset.height);
      }
    });
  });

}).call(this);

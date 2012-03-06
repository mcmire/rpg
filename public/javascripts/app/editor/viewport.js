(function() {

  define('editor.viewport', function() {
    var DRAG_SNAP_GRID_SIZE, meta, util;
    meta = require('meta');
    util = require('util');
    DRAG_SNAP_GRID_SIZE = 16;
    return meta.def({
      init: function(core) {
        this.core = core;
        this.$element = $('#editor-viewport');
        this._recalculateBounds();
        this.objects = [];
        return this;
      },
      _recalculateBounds: function() {
        var offset;
        offset = this.$element.offset();
        return this.bounds = require('game.Bounds').rect(offset.left, offset.top, offset.width, offset.height);
      },
      setHeight: function(height) {
        this.$element.height(height);
        return this._recalculateBounds();
      },
      setWidth: function(width) {
        this.$element.width(width);
        return this._recalculateBounds();
      },
      rememberDragObject: function(_arg) {
        this.$elemBeingDragged = _arg[0], this.objectBeingDragged = _arg[1];
        return this.$map.append(this.$elemBeingDragged);
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
          return _this.$elemBeingDragged.removeClass('drag-helper');
        }).bind('mousedrag.editor.viewport', function(evt) {
          var x, y;
          x = Math.round(evt.pageX - (_this.objectBeingDragged.dims.w / 2)) - _this.bounds.x1;
          y = Math.round(evt.pageY - (_this.objectBeingDragged.dims.h / 2)) - _this.bounds.y1;
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
          return _this.$elemBeingDragged.css('top', "" + y + "px").css('left', "" + x + "px");
        }).bind('mousedragout.editor.viewport', function(evt) {
          console.log('viewport mousedragout');
          _this.$elemBeingDragged.addClass('drag-helper');
          _this.core.rememberDragObject(_this.forgetDragObject());
          return _this.core.positionDragHelper(evt);
        }).one('mousedrop.editor.viewport', function(evt) {
          console.log('viewport drop');
          _this.addObject(_this.$elemBeingDragged, _this.objectBeingDragged);
          return _this.forgetDragObject(false);
        });
      },
      unbindDragEvents: function() {
        $(window).unbind('mousemove.editor.viewport');
        this.$map.unbind('mousedragover.editor.viewport');
        this.$map.unbind('mousedrag.editor.viewport');
        return this.$map.unbind('mousedragout.editor.viewport');
      },
      newMap: function() {
        var $map, canvas, ctx, dragEntered, height, map, mouse, width,
          _this = this;
        canvas = require('game.canvas').create(16, 16);
        ctx = canvas.getContext();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(16, 0.5);
        ctx.moveTo(0.5, 0.5);
        ctx.lineTo(0.5, 16);
        ctx.stroke();
        mouse = null;
        map = null;
        width = 1024;
        height = 1024;
        dragEntered = null;
        this.$elemBeingDragged = null;
        this.objectBeingDragged = null;
        this.$map = $map = $('<div class="editor-map"/>').css('width', width).css('height', height).css('background-image', "url(" + (canvas.element.toDataURL()) + ")").css('background-repeat', 'repeat').bind('mousedown.editor.viewport', function(evt) {
          if (evt.button === 2) return;
          mouse = {
            px: evt.pageX,
            py: evt.pageY
          };
          map = {
            x: parseInt($map.css('left'), 10),
            y: parseInt($map.css('top'), 10)
          };
          $map.css('cursor', 'move');
          evt.preventDefault();
          $(window).bind('mousemove.editor.viewport', function(evt) {
            var dx, dy, h, mapX, mapY, w, x, y;
            x = evt.pageX;
            y = evt.pageY;
            dx = x - mouse.px;
            dy = y - mouse.py;
            mapX = map.x + dx;
            if (mapX > 0) mapX = 0;
            w = -(width - _this.bounds.width);
            if (mapX < w) mapX = w;
            mapY = map.y + dy;
            if (mapY > 0) mapY = 0;
            h = -(height - _this.bounds.height);
            if (mapY < h) mapY = h;
            $map.css("left", "" + mapX + "px");
            $map.css("top", "" + mapY + "px");
            map.x = mapX;
            map.y = mapY;
            mouse.px = x;
            mouse.py = y;
            return evt.preventDefault();
          });
          return $(window).one('mouseup.editor.viewport', function(evt) {
            if (mouse) {
              $map.css('cursor', 'auto');
              mouse = null;
            }
            return $(window).unbind('mousemove.editor.viewport');
          });
        });
        return this.$element.append($map);
      },
      addObject: function($elem, object) {
        var dragOccurred, k, obj, v,
          _this = this;
        obj = {
          '$elem': $elem
        };
        for (k in object) {
          v = object[k];
          obj[k] = v;
        }
        this.objects.push(obj);
        dragOccurred = false;
        return obj.$elem.unbind('.editor').removeClass('drag-helper').bind('mousedown.editor.viewport', function(evt) {
          evt.stopPropagation();
          evt.preventDefault();
          $(window).bind('mousemove.editor.viewport', function(evt) {
            var x, y;
            dragOccurred || (dragOccurred = true);
            x = Math.round(evt.pageX - (obj.dims.w / 2)) - _this.bounds.x1;
            y = Math.round(evt.pageY - (obj.dims.h / 2)) - _this.bounds.y1;
            x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
            y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE;
            return obj.$elem.css('top', "" + y + "px").css('left', "" + x + "px");
          });
          return $(window).one('mouseup.editor.viewport', function(evt) {
            console.log('viewport mouseup');
            $(window).unbind('mousemove.editor.viewport');
            dragOccurred = false;
            return true;
          });
        });
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
      _mouseWithinViewport: function(evt) {
        var _ref, _ref2;
        return (this.bounds.x1 <= (_ref = evt.pageX) && _ref <= this.bounds.x2) && (this.bounds.y1 <= (_ref2 = evt.pageY) && _ref2 <= this.bounds.y2);
      }
    });
  });

}).call(this);

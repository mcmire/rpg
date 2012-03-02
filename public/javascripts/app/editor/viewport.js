(function() {

  define('editor.viewport', function() {
    var meta, util;
    meta = require('meta');
    util = require('util');
    return meta.def({
      init: function(core) {
        this.core = core;
        this.$viewport = $('#editor-viewport');
        this.width = this.$viewport.width();
        this.height = this.$viewport.height();
        return this;
      },
      setHeight: function(height) {
        this.height = height;
        return this.$viewport.height(height);
      },
      setWidth: function(width) {
        this.width = width;
        return this.$viewport.width(width);
      },
      newMap: function() {
        var $map, canvas, ctx, height, map, mouse, stuck, width,
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
        stuck = null;
        $map = $('<div class="editor-map"/>').css('width', width).css('height', height).css('background-image', "url(" + (canvas.element.toDataURL()) + ")").css('background-repeat', 'repeat').bind('mousedown.editor', function(evt) {
          if (evt.button === 2) return;
          mouse = {
            px: evt.pageX,
            py: evt.pageY
          };
          map = {
            top: parseInt($map.css('top'), 10),
            left: parseInt($map.css('left'), 10)
          };
          $map.css('cursor', 'move');
          $map.bind('mousemove.editor', function(evt) {
            var dx, dy, h, left, top, w, x, y;
            x = evt.pageX;
            y = evt.pageY;
            dx = x - mouse.px;
            dy = y - mouse.py;
            top = map.top + dy;
            if (top > 0) top = 0;
            h = -(height - _this.height);
            if (top < h) top = h;
            left = map.left + dx;
            if (left > 0) left = 0;
            w = -(width - _this.width);
            if (left < w) left = w;
            $map.css("top", "" + top + "px");
            $map.css("left", "" + left + "px");
            map.top = top;
            map.left = left;
            mouse.px = x;
            mouse.py = y;
            evt.stopPropagation();
            return evt.preventDefault();
          });
          evt.stopPropagation();
          return evt.preventDefault();
        }).bind('mouseup.editor', function(evt) {
          $map.css('cursor', 'auto');
          $map.unbind('mousemove.editor');
          mouse = null;
          evt.stopPropagation();
          return evt.preventDefault();
        });
        return this.$viewport.append($map);
      }
    });
  });

}).call(this);

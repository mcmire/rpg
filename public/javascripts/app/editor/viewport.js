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
        var $map, canvas, ctx, height, map, mouse, width,
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
        $map = $('<div class="editor-map"/>').css('width', width).css('height', height).css('background-image', "url(" + (canvas.element.toDataURL()) + ")").css('background-repeat', 'repeat').bind('mousedown.editor', function(evt) {
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
          $map.bind('mousemove.editor', function(evt) {
            var dx, dy, h, mapX, mapY, w, x, y;
            x = evt.pageX;
            y = evt.pageY;
            dx = x - mouse.px;
            dy = y - mouse.py;
            mapX = map.x + dx;
            if (mapX > 0) mapX = 0;
            w = -(width - _this.width);
            if (mapX < w) mapX = w;
            mapY = map.y + dy;
            if (mapY > 0) mapY = 0;
            h = -(height - _this.height);
            if (mapY < h) mapY = h;
            $map.css("left", "" + mapX + "px");
            $map.css("top", "" + mapY + "px");
            map.x = mapX;
            map.y = mapY;
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

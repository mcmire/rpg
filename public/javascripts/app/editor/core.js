(function() {

  define('editor.core', function() {
    var meta, util;
    meta = require('meta');
    util = require('util');
    return meta.def({
      init: function() {
        var _this = this;
        this.viewport = require('editor.viewport').init(this);
        this.$sidebar = $('#editor-sidebar');
        this.$mapChooser = $('#editor-map-chooser select');
        this.$layerChooser = $('#editor-layer-chooser select').attr('disabled', 'disabled');
        this._resizeUI();
        $(window).resize(function() {
          return _this._resizeUI();
        });
        this._loadImages();
        this._whenImagesLoaded(function() {
          return _this._populateSidebar();
        });
        return this.viewport.newMap();
      },
      _resizeUI: function() {
        var h, nh, sw, wh, ww;
        wh = $(window).height();
        ww = $(window).width();
        nh = $('#editor-nav').height();
        sw = this.$sidebar.width();
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
        var imageCollection, names, objects, spriteCollection,
          _this = this;
        imageCollection = require('game.imageCollection');
        spriteCollection = require('game.spriteCollection');
        objects = [];
        names = {};
        spriteCollection.each(function(sprite) {
          var dims;
          if (names[sprite.name]) return;
          dims = {
            w: sprite.width,
            h: sprite.height
          };
          objects.push([dims, sprite, sprite.image]);
          return names[sprite.name] = 1;
        });
        imageCollection.each(function(image) {
          var dims;
          if (image.name === 'link2x') return;
          if (names[image.name]) return;
          dims = {
            w: image.width,
            h: image.height
          };
          objects.push([dims, image, image]);
          return names[image.name] = 1;
        });
        objects = objects.sort(function(x1, x2) {
          var d1, d2, h1, h2, w1, w2, _ref, _ref2, _ref3;
          _ref = [x1[0], x2[0]], d1 = _ref[0], d2 = _ref[1];
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
        return $.v.each(objects, function(_arg) {
          var $div, dims, image, object;
          dims = _arg[0], object = _arg[1], image = _arg[2];
          $div = $("<div/>").addClass('img').data('name', name).width(dims.w).height(dims.h).append(image.getElement());
          return _this.$sidebar.append($div);
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
      }
    });
  });

}).call(this);

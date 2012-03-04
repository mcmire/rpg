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
        x = Math.round(evt.pageX - (this.objectBeingDragged.dims.w / 2));
        y = Math.round(evt.pageY - (this.objectBeingDragged.dims.h / 2));
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
        var dragOccurred, imageCollection, names, objects, spriteCollection,
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
          objects.push({
            dims: dims,
            object: sprite,
            image: sprite.image
          });
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
          objects.push({
            dims: dims,
            object: image,
            image: image
          });
          return names[image.name] = 1;
        });
        objects = objects.sort(function(x1, x2) {
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
        dragOccurred = false;
        this.$elemBeingDragged = null;
        this.objectBeingDragged = null;
        return $.v.each(objects, function(so) {
          var $div;
          $div = $("<div/>").addClass('img').data('name', so.object.name).width(so.dims.w).height(so.dims.h).append(so.image.getElement()).bind('mousedown.editor.core', function(evt) {
            evt.preventDefault();
            $(window).bind('mousemove.editor.core', function(evt) {
              if (!dragOccurred) {
                $div.trigger('mousedragstart.editor.core', evt);
                dragOccurred = true;
              }
              if (_this.$elemBeingDragged) {
                return _this.positionDragHelper(evt);
              } else {

              }
            });
            return $(window).one('mouseup.editor.core', function(evt) {
              console.log('core mouseup');
              if (dragOccurred) $div.trigger('mousedragend.editor.core', evt);
              $(window).unbind('mousemove.editor.core');
              dragOccurred = false;
              return true;
            });
          }).bind('mousedragstart.editor.core', function(evt) {
            var $elemBeingDragged;
            console.log('core mousedragstart');
            $elemBeingDragged = $($div[0].cloneNode(true)).addClass('editor-map-object').addClass('drag-helper').removeClass('img');
            _this.rememberDragObject([$elemBeingDragged, so]);
            $(document.body).addClass('editor-drag-active');
            return _this.viewport.bindDragEvents();
          }).bind('mousedragend.editor.core', function(evt) {
            console.log('core mousedragend');
            _this.viewport.unbindDragEvents();
            $(document.body).removeClass('editor-drag-active');
            if (_this.$elemBeingDragged) return _this.forgetDragObject();
          });
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

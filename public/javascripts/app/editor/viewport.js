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
      /*
          bindDndEvents: ->
            console.log 'viewport: binding dnd events'
            evtNamespace = 'editor.viewport.dnd'
      
            mouseLocation = null
            # we are binding mousemove to the window instead of the viewport - binding
            # to the viewport won't work as the mouse is already on top of the drag
            # helper when it is dragged into the viewport
            $(window)
              .bind "mousemove.#{evtNamespace}", (evt) =>
                if @_mouseWithinViewport(evt)
                  if mouseLocation isnt 'inside'
                    # fire only the first time
                    @$map.trigger "mousedragover.#{evtNamespace}", evt
                    mouseLocation = 'inside'
                  @$map.trigger "mousedrag.#{evtNamespace}", evt
                else if @$elemBeingDragged and mouseLocation isnt 'outside'
                  # fire only the first time
                  @$map.trigger "mousedragout.#{evtNamespace}", evt
                  mouseLocation = 'outside'
      
            @$map
              .one "mouseup.#{evtNamespace}", (evt) =>
                console.log 'viewport: map mouseup (dnd)'
                if @$elemBeingDragged
                  @$map.trigger "mousedrop.#{evtNamespace}", evt
                # evt.preventDefault()
      
              .bind "mousedragover.#{evtNamespace}", (evt) =>
                console.log 'viewport: map mousedragover (dnd)'
                @rememberDragObject(@core.forgetDragObject())
                @$elemBeingDragged.removeClass('editor-drag-helper')
      
              .bind "mousedrag.#{evtNamespace}", (evt) =>
                # console.log 'viewport: map drag'
                $elem = @$elemBeingDragged
                x = evt.pageX - @core.dragOffset.x - @map.x1 - @bounds.x1
                y = evt.pageY - @core.dragOffset.y - @map.y1 - @bounds.y1
                $elem.css('top', "#{y}px").css('left', "#{x}px")
      
              .bind "mousedragout.#{evtNamespace}", (evt) =>
                console.log 'viewport: map mousedragout (dnd)'
                @$elemBeingDragged.addClass('editor-drag-helper')
                @core.rememberDragObject(@forgetDragObject())
                # call this preemptively to prevent a jump when dragging an object
                # back out of the viewport
                @core.positionDragHelper(evt)
      
              .bind "mousedrop.#{evtNamespace}", (evt) =>
                console.log 'viewport: map drop (dnd)'
                $elem = @$elemBeingDragged
                x = parseInt($elem.css('left'), 10)
                y = parseInt($elem.css('top'), 10)
                x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
                y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
                $elem.css('top', "#{y}px").css('left', "#{x}px")
                @addObject(@core.getCurrentLayer(), @$elemBeingDragged, @objectBeingDragged)
                @forgetDragObject(false)
                @saveMap()
      
          unbindDndEvents: ->
            console.log 'viewport: unbinding dnd events'
            evtNamespace = 'editor.viewport.dnd'
            $(window).unbind('.' + evtNamespace)
            @$map.unbind('.' + evtNamespace)
      */
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
          try {
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
        var BACKSPACE_KEY, DELETE_KEY, evtNamespace, layerSel, viewport,
          _this = this;
        console.log('viewport: activating normal tool (layer: tiles)');
        evtNamespace = 'editor.viewport.layer-tiles.tool-normal';
        viewport = this;
        layerSel = '.editor-layer[data-layer=tiles]';
        this.$element.dropTarget({
          receptor: '.editor-layer[data-layer=tiles] .editor-layer-content'
        }).bind('mousedropwithin', function(evt) {
          var $draggee;
          $draggee = $(evt.relatedTarget);
          _this.addObject('tiles', $draggee);
          return _this.saveMap();
        });
        /*
              dragStarted = false
              dragOffset = null
              @$map
                .delegate sel, "mousedown.#{evtNamespace}", (evt) ->
                  console.log 'viewport: map object mousedown (tiles/normal)'
                  $this = $(this)
        
                  # don't move the object accidentally if it is right-clicked
                  # FIXME so this handles ctrl-click too
                  return if evt.button is 2
        
                  evt.stopPropagation()  # so that the map doesn't move
                  evt.preventDefault()
        
                  $(window).bind "mousemove.#{evtNamespace}", (evt) ->
                    unless dragStarted
                      $this.trigger "mousedragstart.#{evtNamespace}", evt
                      dragStarted = true
                    $this.trigger "mousedrag.#{evtNamespace}", evt
        
                  # bind mouseup to the window as it may occur outside of the image
                  $(window).one "mouseup.#{evtNamespace}", (evt) ->
                    console.log 'viewport: map object mouseup'
                    if dragStarted
                      $this.trigger "mousedragend.#{evtNamespace}", evt
                    dragStarted = false
                    dragOffset = null
                    $(window).unbind "mousemove.#{evtNamespace}"
                    return true
        
                .delegate sel, "mousedragstart.#{evtNamespace}", (evt) ->
                  console.log 'viewport: map object mousedragstart (tiles/normal)'
                  $this = $(this)
        
                  viewport.$element.addClass('editor-drag-active')
                  offset = $this.offset()
                  dragOffset =
                    x: evt.pageX - offset.left
                    y: evt.pageY - offset.top
        
                .delegate sel, "mousedrag.#{evtNamespace}", (evt) ->
                  # console.log 'viewport: map object drag'
                  $this = $(this)
                  x = evt.pageX - dragOffset.x - viewport.map.x1 - viewport.bounds.x1
                  y = evt.pageY - dragOffset.y - viewport.map.y1 - viewport.bounds.y1
                  $this.css('top', "#{y}px").css('left', "#{x}px")
        
                .delegate sel, "mousedragend.#{evtNamespace}", (evt) ->
                  console.log 'viewport: map object mousedragend (tiles/normal)'
                  $this = $(this)
                  viewport.$element.removeClass('editor-drag-active')
                  # apply snapping
                  x = parseInt($this.css('left'), 10)
                  y = parseInt($this.css('top'), 10)
                  x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
                  y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
                  $this.css('top', "#{y}px").css('left', "#{x}px")
                  viewport.saveMap()
        
                .delegate sel, "mouseup.#{evtNamespace}", (evt) ->
                  console.log 'viewport: map object mouseup (tiles/normal)'
                  $this = $(this)
                  unless dragStarted
                    # just a normal click
                    state = $this.attr('data-is-selected')
                    newstate = if state is 'no' or !state then 'yes' else 'no'
                    $this.attr('data-is-selected', newstate)
                  return true
        
              @$map.bind "mouseup.#{evtNamespace}", (evt) =>
                console.log 'viewport: map mouseup (tiles/normal)'
                @$map.find('.editor-map-object')
                  .removeClass('editor-selected')
                @$map.find('.editor-map-object[data-is-selected=yes]')
                  .addClass('editor-selected')
                  .removeAttr('data-is-selected')
        */
        BACKSPACE_KEY = 8;
        DELETE_KEY = 46;
        return $(window).bind("keydown." + evtNamespace, function(evt) {
          if (evt.keyCode === DELETE_KEY || evt.keyCode === BACKSPACE_KEY) {
            evt.preventDefault();
            _this.$map.find('.editor-map-object.editor-selected').each(function(elem) {
              var $elem, objectId;
              $elem = $(elem);
              objectId = $elem.data('moid');
              console.log("viewport: removing object " + objectId);
              delete _this.objectsByLayer[_this.core.getCurrentLayer()][objectId];
              return $elem.remove();
            });
            return _this.saveMap();
          }
        });
      },
      deactivate_tiles_normal_tool: function() {
        var evtNamespace, sel;
        console.log('viewport: deactivating normal tool (layer: tiles)');
        evtNamespace = 'editor.viewport.layer-tiles.tool-normal';
        sel = '.editor-layer[data-layer=tiles] .editor-map-object';
        $(sel).unbind('.' + evtNamespace);
        this.$map.unbind('.' + evtNamespace);
        return $(window).unbind('.' + evtNamespace);
      },
      activate_hand_tool: function() {
        var evtNamespace,
          _this = this;
        console.log('viewport: deactivating hand tool');
        evtNamespace = 'editor.viewport.layer-tiles.tool-normal';
        return this.$map.bind("mousedown." + evtNamespace, function(evt) {
          var mouse;
          if (evt.button === 2) return;
          mouse = {
            px: evt.pageX,
            py: evt.pageY
          };
          evt.preventDefault();
          $(window).bind("mousemove." + evtNamespace, function(evt) {
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
          return $(window).one("mouseup." + evtNamespace, function(evt) {
            if (mouse) mouse = null;
            return $(window).unbind("mousemove." + evtNamespace);
          });
        });
      },
      deactivate_hand_tool: function() {
        console.log('viewport: deactivating hand tool');
        this.$map.unbind('.' + evtNamespace);
        return $(window).unbind('.' + evtNamespace);
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
        this.objectsByLayer[layer][this.objectId] = obj;
        this.objectId++;
        return typeof this[_name = "_activate_" + layer + "_" + this.core.currentTool + "_tool_for_object"] === "function" ? this[_name](obj) : void 0;
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

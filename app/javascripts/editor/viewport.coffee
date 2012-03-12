
define 'editor.viewport', ->
  meta = require('meta')
  util = require('util')
  Bounds = require('game.Bounds')

  DRAG_SNAP_GRID_SIZE = 16

  meta.def
    init: (@core) ->
      @$element = $('#editor-viewport')
      @_initMapElement()
      @_initBounds()
      @map = null
      @objectsByLayer = $.v.reduce @core.getLayers(), ((h, n) -> h[n] = {}; h), {}
      @objectId = 0
      return this

    setWidth: (width) ->
      @$element.width(width)
      @bounds.setWidth(width)

    setHeight: (height) ->
      @$element.height(height)
      @bounds.setHeight(height)

    rememberDragObject: ([@$elemBeingDragged, @objectBeingDragged]) ->
      @core.getCurrentLayerElem().find('.editor-layer-content')
        .append(@$elemBeingDragged)

    forgetDragObject: (removeElement=true) ->
      [a, b] = [@$elemBeingDragged, @objectBeingDragged]
      @$elemBeingDragged.remove() if removeElement
      delete @$elemBeingDragged
      delete @objectBeingDragged
      return [a, b]

    # setMap: (currentMap) ->
    #   @currentMap = map
    #   map.setParent(this)
    #   map.attach()

    # unsetMap: ->
    #   @currentMap.detach()

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

    loadMap: ->
      @map = Bounds.rect(0, 0, 1024, 1024)

      mouse = null
      dragEntered = null
      @$elemBeingDragged = null
      @objectBeingDragged = null

      @$map
        .css('width', @map.width)
        .css('height', @map.height)
        .removeClass('editor-map-unloaded')

      # TODO: Refactor
      localStorage.removeItem('editor.map')
      if data = localStorage.getItem('editor.map')
        try
          objectsByLayer = JSON.parse(data)
          $.v.each objectsByLayer, (layer, objects) =>
            $.v.each objects, (o) =>
              object = @core.objectsByName[o.name]
              # clone the image
              elem = object.$elem[0].cloneNode(true)
              elem.removeAttribute('data-node-uid')
              $elem = $(elem)
              $elem.addClass('editor-map-object')
              $elem.css('left', "#{o.x}px")
              $elem.css('top', "#{o.y}px")
              @core.findLayer(layer).find('.editor-layer-content').append($elem)
              @addObject(layer, $elem, object)
        catch e
          console.warn "Had a problem loading the map!"
          throw e

    activate_tiles_normal_tool: ->
      console.log 'viewport: activating normal tool (layer: tiles)'
      evtNamespace = 'editor.viewport.layer-tiles.tool-normal'
      viewport = this

      sel = '.editor-layer[data-layer=tiles] .editor-map-object'

      # TODO: Do we really need this?
      $(sel)
        .unbind('.editor')
        .removeClass('editor-drag-helper')

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

      BACKSPACE_KEY = 8
      DELETE_KEY    = 46
      $(window)
        # this cannot be on keyup b/c backspace will go back to the prev page
        # immediately on keydown so we have to catch that
        .bind "keydown.#{evtNamespace}", (evt) =>
          if evt.keyCode is DELETE_KEY or evt.keyCode is BACKSPACE_KEY
            evt.preventDefault()
            @$map.find('.editor-map-object.editor-selected').each (elem) =>
              $elem = $(elem)
              objectId = $elem.data('moid')
              console.log "viewport: removing object #{objectId}"
              delete @objectsByLayer[@core.getCurrentLayer()][objectId]
              $elem.remove()
            @saveMap()

    deactivate_tiles_normal_tool: ->
      console.log 'viewport: deactivating normal tool (layer: tiles)'
      evtNamespace = 'editor.viewport.layer-tiles.tool-normal'
      sel = '.editor-layer[data-layer=tiles] .editor-map-object'
      # XXX: does this work even for the delegate?
      $(sel).unbind('.' + evtNamespace)
      @$map.unbind('.' + evtNamespace)
      $(window).unbind('.' + evtNamespace)

    activate_hand_tool: ->
      console.log 'viewport: deactivating hand tool'
      evtNamespace = 'editor.viewport.layer-tiles.tool-normal'
      @$map
        .bind "mousedown.#{evtNamespace}", (evt) =>
          # don't pan the map accidentally if it is right-clicked
          # FIXME so this handles ctrl-click too
          return if evt.button is 2

          # previous mouse position
          mouse =
            px:  evt.pageX
            py:  evt.pageY

          # prevent anything that may occur on mousedown
          evt.preventDefault()

          $(window).bind "mousemove.#{evtNamespace}", (evt) =>
            x = evt.pageX
            y = evt.pageY

            # allow the user to drag the map in order to pan around, but do not
            # allow the user to pan past the bounds of the map

            dx = x - mouse.px
            dy = y - mouse.py

            mapX = @map.x1 + dx
            mapX = 0 if mapX > 0
            w = -(@map.width - @bounds.width)
            mapX = w if mapX < w

            mapY = @map.y1 + dy
            mapY = 0 if mapY > 0
            h = -(@map.height - @bounds.height)
            mapY = h if mapY < h

            @$map.css("left", "#{mapX}px")
            @$map.css("top", "#{mapY}px")
            @map.anchor(mapX, mapY)

            mouse.px = x
            mouse.py = y

            # prevent selection
            evt.preventDefault()

          $(window).one "mouseup.#{evtNamespace}", (evt) =>
            if mouse
              mouse = null
            $(window).unbind "mousemove.#{evtNamespace}"

    deactivate_hand_tool: ->
      console.log 'viewport: deactivating hand tool'
      @$map.unbind('.' + evtNamespace)
      $(window).unbind('.' + evtNamespace)

    addObject: (layer, $elem, object) ->
      console.log 'viewport: addObject'
      obj = {}
      obj.moid = @objectId
      obj[k] = v for own k, v of object
      obj.$elem = $elem
      $elem.data('moid', @objectId)
      @objectsByLayer[layer][@objectId] = obj
      @objectId++

      @["_activate_#{layer}_#{@core.currentTool}_tool_for_object"]?(obj)

    saveMap: ->
      console.log 'viewport: saving map...'
      data = $.v.reduce $.v.keys(@objectsByLayer), (hash, layer) =>
        arr = $.v.map @objectsByLayer[layer], (id, object) ->
          name: object.name
          x: parseInt(object.$elem.css('left'), 10)
          y: parseInt(object.$elem.css('top'), 10)
        hash[layer] = arr
        return hash
      , {}
      localStorage.setItem('editor.map', JSON.stringify(data))

    _mouseWithinViewport: (evt) ->
      @bounds.x1 <= evt.pageX <= @bounds.x2 and
      @bounds.y1 <= evt.pageY <= @bounds.y2

    _initMapElement: ->
      @$map = $('#editor-map')
      for layer, i in @core.getLayers()
        $layer = $("""
          <div class="editor-layer" data-layer="#{layer}">
            <div class="editor-layer-bg"></div>
            <div class="editor-layer-content"></div>
          </div>
        """)
        $layer.css('z-index', (i + 1) * 10)
        @$map.append($layer)

    _initBounds: ->
      offset = @$element.offset()
      @bounds = Bounds.rect(offset.left, offset.top, offset.width, offset.height)

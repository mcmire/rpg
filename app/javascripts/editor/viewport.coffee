
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

    bindDragEvents: ->
      console.log 'binding drag events to viewport'

      mouseLocation = null
      # we are binding mousemove to the window instead of the viewport - binding
      # to the viewport won't work as the mouse is already on top of the drag
      # helper when it is dragged into the viewport
      $(window)
        .bind 'mousemove.editor.viewport', (evt) =>
          if @_mouseWithinViewport(evt)
            if mouseLocation isnt 'inside'
              # fire only the first time
              @$map.trigger 'mousedragover.editor.viewport', evt
              mouseLocation = 'inside'
            @$map.trigger 'mousedrag.editor.viewport', evt
          else if @$elemBeingDragged and mouseLocation isnt 'outside'
            # fire only the first time
            @$map.trigger 'mousedragout.editor.viewport', evt
            mouseLocation = 'outside'

      @$map
        .one 'mouseup.editor.viewport', (evt) =>
          console.log 'viewport mouseup'
          if @$elemBeingDragged
            @$map.trigger 'mousedrop.editor.viewport', evt
          # evt.preventDefault()

        .bind 'mousedragover.editor.viewport', (evt) =>
          console.log 'viewport mousedragover'
          @rememberDragObject(@core.forgetDragObject())
          @$elemBeingDragged.removeClass('editor-drag-helper')

        .bind 'mousedrag.editor.viewport', (evt) =>
          # console.log 'viewport drag'
          $elem = @$elemBeingDragged
          x = evt.pageX - @core.dragOffset.x - @map.x1 - @bounds.x1
          y = evt.pageY - @core.dragOffset.y - @map.y1 - @bounds.y1
          $elem.css('top', "#{y}px").css('left', "#{x}px")

        .bind 'mousedragout.editor.viewport', (evt) =>
          console.log 'viewport mousedragout'
          @$elemBeingDragged.addClass('editor-drag-helper')
          @core.rememberDragObject(@forgetDragObject())
          # call this preemptively to prevent a jump when dragging an object
          # back out of the viewport
          @core.positionDragHelper(evt)

        .bind 'mousedrop.editor.viewport', (evt) =>
          console.log 'viewport drop'
          $elem = @$elemBeingDragged
          x = parseInt($elem.css('left'), 10)
          y = parseInt($elem.css('top'), 10)
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          $elem.css('top', "#{y}px").css('left', "#{x}px")
          @addObject(@core.getCurrentLayer(), @$elemBeingDragged, @objectBeingDragged)
          @forgetDragObject(false)
          @saveMap()

    unbindDragEvents: ->
      console.log 'removing drag events from viewport'
      $(window).unbind 'mousemove.editor.viewport'
      @$map.unbind 'mousedragover.editor.viewport'
      @$map.unbind 'mousedrag.editor.viewport'
      @$map.unbind 'mousedragout.editor.viewport'
      @$map.unbind 'mousedrop.editor.viewport'

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
      if data = localStorage.getItem('editor.map')
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
            @core.getCurrentLayerElem().find('.editor-layer-content').append($elem)
            @addObject(layer, $elem, object)

    activateNormalTool: ->
      selecteds = []
      $.v.each @objectsByLayer['tiles'], (id, obj) =>
        @activateNormalToolForObject(obj)

      @$map.bind 'mouseup.editor.viewport.selection', (evt) =>
        console.log 'map mouseup'
        @$map.find('.editor-map-object')
          .removeClass('editor-selected')
        @$map.find('.editor-map-object[data-is-selected=yes]')
          .addClass('editor-selected')

      BACKSPACE_KEY = 8
      DELETE_KEY    = 46
      $(window)
        # this cannot be on keyup b/c backspace will go back to the prev page
        # immediately on keydown so we have to catch that
        .bind 'keydown.editor.viewport', (evt) =>
          if evt.keyCode is DELETE_KEY or evt.keyCode is BACKSPACE_KEY
            evt.preventDefault()
            @$map.find('.editor-map-object.editor-selected').each (elem) =>
              $elem = $(elem)
              objectId = $elem.data('moid')
              console.log "removing object #{objectId}"
              delete @objectsByLayer[@core.getCurrentLayer()][objectId]
              $elem.remove()
            @saveMap()

    activateNormalToolForObject: (obj) ->
      dragStarted = false
      dragOffset = null
      $elem = obj.$elem
      obj.$elem
        .unbind('.editor')
        .removeClass('drag-helper')

        .bind 'mousedown.editor.viewport', (evt) =>
          console.log 'map object mousedown'

          # don't move the object accidentally if it is right-clicked
          # FIXME so this handles ctrl-click too
          return if evt.button is 2

          evt.stopPropagation()  # so that the map doesn't move
          evt.preventDefault()

          $(window).bind 'mousemove.editor.viewport', (evt) =>
            unless dragStarted
              obj.$elem.trigger 'mousedragstart.editor.viewport', evt
              dragStarted = true
            $elem.trigger 'mousedrag.editor.viewport', evt

          # bind mouseup to the window as it may occur outside of the image
          $(window).one 'mouseup.editor.viewport', (evt) =>
            console.log 'viewport mouseup'
            if dragStarted
              $elem.trigger 'mousedragend.editor.viewport', evt
            dragStarted = false
            dragOffset = null
            $(window).unbind 'mousemove.editor.viewport'
            return true

        .bind 'mousedragstart.editor.viewport', (evt) =>
          console.log 'map object mousedragstart'
          $(document.body).addClass('editor-drag-active')
          offset = $elem.offset()
          dragOffset =
            x: evt.pageX - offset.left
            y: evt.pageY - offset.top

        .bind 'mousedrag.editor.viewport', (evt) =>
          x = evt.pageX - dragOffset.x - @map.x1 - @bounds.x1
          y = evt.pageY - dragOffset.y - @map.y1 - @bounds.y1
          $elem.css('top', "#{y}px").css('left', "#{x}px")

        .bind 'mousedragend.editor.viewport', (evt) =>
          console.log 'map object mousedragend'
          $(document.body).removeClass('editor-drag-active')
          # apply snapping
          x = parseInt($elem.css('left'), 10)
          y = parseInt($elem.css('top'), 10)
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          $elem.css('top', "#{y}px").css('left', "#{x}px")
          @saveMap()

        .bind 'mouseup.editor.viewport.selection', (evt) =>
          console.log 'map object mouseup'
          unless dragStarted
            # just a normal click
            # moid = $elem.data('moid')
            # if moid in selecteds
            #   delete selecteds[moid]
            # else
            #   selecteds[moid] = 1
            state = $elem.attr('data-is-selected')
            newstate = if state is 'no' or !state then 'yes' else 'no'
            $elem.attr('data-is-selected', newstate)
          return true

    deactivateNormalTool: ->
      $.v.each @objectsByLayer['tiles'], (id, obj) ->
        obj.$elem
          .unbind('mousedown.editor.viewport')
          .unbind('mousedragstart.editor.viewport')
          .unbind('mousedrag.editor.viewport')
          .unbind('mousedragend.editor.viewport')
      @$map.unbind 'mouseup.editor.viewport'

    activateHandTool: ->
      $map = @$map
      @$map
        .bind 'mousedown.editor.viewport', (evt) =>
          # don't pan the map accidentally if it is right-clicked
          # FIXME so this handles ctrl-click too
          return if evt.button is 2

          # previous mouse position
          mouse =
            px:  evt.pageX
            py:  evt.pageY

          # $map.css('cursor', 'move')

          # prevent anything that may occur on mousedown
          evt.preventDefault()

          $(window).bind 'mousemove.editor.viewport', (evt) =>
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

            $map.css("left", "#{mapX}px")
            $map.css("top", "#{mapY}px")
            @map.anchor(mapX, mapY)

            mouse.px = x
            mouse.py = y

            # prevent selection
            evt.preventDefault()

          $(window).one 'mouseup.editor.viewport', (evt) =>
            if mouse
              # $map.css('cursor', 'auto')
              mouse = null
            $(window).unbind 'mousemove.editor.viewport'

    deactivateHandTool: ->
      @$map.unbind 'mousedown.editor.viewport'

    addObject: (layer, $elem, object) ->
      console.log 'addObject'
      obj = {}
      obj.moid = @objectId
      obj[k] = v for own k, v of object
      obj.$elem = $elem
      $elem.data('moid', @objectId)
      @objectsByLayer[layer][@objectId] = obj

      if @core.currentTool is 'normal'
        @activateNormalToolForObject(obj)

      @objectId++

    stealFrom: (obj, prop) ->
      @[prop] = obj.delete(prop)

    giveTo: (obj, prop) ->
      obj[prop] = @delete(prop)

    delete: (prop) ->
      val = @[prop]
      delete @[prop]
      return val

    saveMap: ->
      console.log 'saving map...'
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

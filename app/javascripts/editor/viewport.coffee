
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

      layerSel = '.editor-layer[data-layer=tiles]'

      @$element
        .dropTarget(
          receptor: '.editor-layer[data-layer=tiles] .editor-layer-content'
        )
        .bind 'mousedropwithin', (evt) =>
          $draggee = $(evt.relatedTarget)
          @addObject('tiles', $draggee)
          @saveMap()

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

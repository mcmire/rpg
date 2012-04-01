
define 'editor.viewport', ->
  meta = require('meta')
  require('editor.DropTarget')

  GRID_SIZE = 16

  meta.def
    init: (@core) ->
      @keyboard = @core.keyboard

      @$elem = $('#editor-viewport')
      @$map = $('#editor-map')
      @_initMapGrid()
      @$mapLayers = $('#editor-map-layers')
      @_initBounds()
      @map = null
      @objectsByLayer = $.v.reduce @core.getLayers(), ((h, n) -> h[n] = {}; h), {}
      @objectId = 0
      return this

    getElement: -> @$elem

    getMapLayers: -> @$mapLayers

    setWidth: (width) ->
      @$elem.width(width)
      @bounds.setWidth(width)

    setHeight: (height) ->
      @$elem.height(height)
      @bounds.setHeight(height)

    addLayer: (layer) ->
      $layer = $("""
        <div class="editor-layer" data-layer="#{layer}">
          <div class="editor-layer-bg"></div>
          <div class="editor-layer-content"></div>
        </div>
      """)
      # $layer.css('z-index', (i + 1) * 10)
      @$mapLayers.append($layer)

    loadMap: ->
      @map = require('game.Bounds').rect(0, 0, 1024, 1024)

      @$map
        .removeClass('editor-map-unloaded')
        .size(w: @map.width, h: @map.height)

      # TODO: Refactor
      # localStorage.removeItem('editor.map')
      if data = localStorage.getItem('editor.map')
        try
          objectsByLayer = JSON.parse(data)
          console.log 'map data': data
          $.v.each objectsByLayer, (layer, objects) =>
            $.v.each objects, (o) =>
              object = @core.objectsByName[o.name]
              $elem = object.$elem.clone()
              $elem.addClass('editor-map-object')
              $elem.css('left', "#{o.x}px")
              $elem.css('top', "#{o.y}px")
              @core.findLayer(layer).find('.editor-layer-content').append($elem)
              @addObject(layer, $elem, object)
        catch e
          console.warn "Had a problem loading the map!"
          throw e

    activate_tiles_normal_tool: ->
      evtns = 'editor.viewport.layer-tiles.tool-normal'
      viewport = this

      layerSel = '#editor-map .editor-layer[data-layer=tiles]'
      mapObjectsSel = "#{layerSel} .editor-map-object"

      @$elem
        .dropTarget(
          receptor: "#{layerSel} .editor-layer-content"
        )
        .bind "mousedropwithin.#{evtns}", (evt) =>
          console.log "#{evtns}: mousedropwithin"
          dragObject = evt.relatedObject
          $dragOwner = dragObject.getElement()
          $draggee = dragObject.getDraggee()

          # mousedropwithin will get fired even when moving map objects around
          # within the map, so we have to check for the first fire when the
          # object is added
          if not @objectExistsIn('tiles', $draggee)
            @addObject('tiles', $draggee, $dragOwner.data('so'))
            @_addEventsToMapObjects($draggee)

          $draggee.position(@_roundCoordsToGrid($draggee.position()))
          @saveMap()

      @_addEventsToMapObjects $(mapObjectsSel)

      @$map.bind "mouseup.#{evtns}", (evt) =>
        console.log "#{evtns}: mouseup"
        @$map.find('.editor-map-object')
          .removeClass('editor-selected')
        @$map.find('.editor-map-object[data-is-selected=yes]')
          .addClass('editor-selected')
          .removeAttr('data-is-selected')

      $(window)
        # this cannot be on keyup b/c backspace will go back to the prev page
        # immediately on keydown so we have to catch that
        .bind "keydown.#{evtns}", (evt) =>
          if @keyboard.isKeyPressed(evt, 'backspace', 'delete')
            evt.preventDefault()
            $selectedObjects = @$map.find('.editor-map-object.editor-selected')
            if $selectedObjects.length
              $selectedObjects.each (elem) =>
                $elem = $(elem)
                objectId = $elem.data('moid')
                console.log "viewport: removing object #{objectId}"
                delete @objectsByLayer[@core.getCurrentLayer()][objectId]
                $elem.remove()
              @saveMap()

    deactivate_tiles_normal_tool: ->
      evtns = 'editor.viewport.layer-tiles.tool-normal'

      layerSel = '#editor-map .editor-layer[data-layer=tiles]'
      mapObjectsSel = "#{layerSel} .editor-map-object"

      @$elem
        .dropTarget('destroy')
        .unbind(".#{evtns}")
      @_removeEventsFromMapObjects $(mapObjectsSel)
      @$map.unbind(".#{evtns}")
      $(window).unbind(".#{evtns}")

    activate_hand_tool: ->
      evtns = 'editor.viewport.tool-hand'
      dragActive = false
      @$elem
        .bind "mousedown.#{evtns}", (evt) =>
          console.log 'viewport: mousedown (hand tool)'

          # don't pan the map accidentally if it is right-clicked
          # FIXME so this handles ctrl-click too
          return if evt.button is 2

          # previous mouse position
          mouse =
            px:  evt.pageX
            py:  evt.pageY

          # prevent anything that may occur on mousedown
          evt.preventDefault()

          $(window).bind "mousemove.#{evtns}", (evt) =>
            unless dragActive
              # do only when the drag starts
              $(document.body).addClass('editor-drag-active')
              dragActive = true

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

          $(window).one "mouseup.#{evtns}", (evt) =>
            $(document.body).removeClass('editor-drag-active')
            dragActive = false
            mouse = null
            $(window).unbind "mousemove.#{evtns}"

    deactivate_hand_tool: ->
      evtns = 'editor.viewport.tool-hand'
      @$elem.unbind(".#{evtns}")
      $(window).unbind(".#{evtns}")

    activate_fill_select_tool: ->
      evtns = 'editor.viewport.layer-fill.tool-select'

      mouseDownAt = null
      activeSelections = []

      SELECTION_ACTIVATION_OFFSET = 4  # pixels

      $layerElem = @core.getCurrentLayerElem().find('.editor-layer-content')

      clearActiveSelections = ->
        activeSelections = []
        # selection.$box.remove() does not work for some reason
        $layerElem.find('.editor-selection-box').remove()

      selectionEvents = do =>
        mouseupBound = false
        clearSelection = (evt) ->
          console.log 'clearing selection'
          evt.preventDefault()
          clearActiveSelections()
        ex = {}
        ex.add = =>
          return if mouseupBound
          console.log 'binding mouseup'
          mouseupBound = true
          @$elem.bind("mouseup.#{evtns}", clearSelection)
        ex.remove = =>
          return if not mouseupBound
          console.log 'unbinding mouseup'
          mouseupBound = false
          @$elem.unbind(clearSelection)
        return ex

      # TODO: Extract to a method of viewport
      adjustCoords = (p) =>
        x: p.x - @bounds.x1
        y: p.y - @bounds.y1

      @$elem
        .bind "mousedown.#{evtns}", (evt) =>
          # don't open a selection box accidentally if the map is right-clicked
          # FIXME so this handles ctrl-click too
          return if evt.button is 2

          evt.preventDefault()

          selectionStartedAt = @_roundCoordsToGrid(
            adjustCoords(x: evt.pageX, y: evt.pageY)
          )

          @$elem.bind "mousemove.#{evtns}", (evt) =>
            evt.preventDefault()

            clearActiveSelections()
            selectionEvents.remove()

            selection = {}
            selection.pos = selectionStartedAt
            selection.$box = $('<div class="editor-selection-box">')
              .appendTo($layerElem)
            activeSelections.push(selection)

            mouse = @_roundCoordsToGrid(
              adjustCoords(x: evt.pageX, y: evt.pageY)
            )
            if mouse.x < selection.pos.x
              # cursor is left of where the selection started
              x = mouse.x
              w = selection.pos.x - mouse.x
            else
              # cursor is right of where the selection started
              x = selection.pos.x
              w = mouse.x - selection.pos.x
            if mouse.y < selection.pos.y
              # cursor is above where the selection started
              y = mouse.y
              h = selection.pos.y - mouse.y
            else
              # cursor is below where the selection started
              y = selection.pos.y
              h = mouse.y - selection.pos.y

            if w is 0 and h is 0
              # cursor is where the selection started, don't draw the box
              selection.$box.hide()
            else
              # draw the box
              selection.$box
                .show()
                .moveTo({x, y})
                .size(w: w-1, h: h-1)

        .delegate '.editor-selection-box', "mousedown.#{evtns}", (evt) ->
          console.log 'selection box mousedown'
          evt.preventDefault()
          selectionEvents.remove()

        .delegate '.editor-selection-box', "mouseup.#{evtns}", (evt) ->
          console.log 'selection box mouseup'
          # delay the re-addition of the mouseup event ever so slightly
          # otherwise it gets fired immediately (since we're in the mouseup
          # event ourselves)
          setTimeout selectionEvents.add, 0

        .bind "mouseup.#{evtns}", (evt) =>
          @$elem.unbind "mousemove.#{evtns}"
          mouseDownAt = null
          # delay the re-addition of the mouseup event ever so slightly
          # otherwise it gets fired immediately (since we're in the mouseup
          # event ourselves)
          setTimeout selectionEvents.add, 0

      selectionEvents.add()

    deactivate_fill_select_tool: ->
      evtns = 'editor.viewport.layer-fill.tool-select'
      @$elem.unbind(".#{evtns}")

    addObject: (layer, $elem, object) ->
      console.log 'viewport: addObject'
      obj = {}
      obj.moid = @objectId
      obj[k] = v for own k, v of object
      obj.$elem = $elem
      $elem.data('moid', @objectId)
      console.log adding: obj
      @objectsByLayer[layer][@objectId] = obj
      @objectId++

      @["_activate_#{layer}_#{@core.currentTool}_tool_for_object"]?(obj)

    objectExistsIn: (layer, $elem) ->
      moid = $elem.data('moid')
      !!@objectsByLayer[layer][moid]

    saveMap: ->
      console.log 'viewport: saving map...'
      data = $.v.reduce $.v.keys(@objectsByLayer), (hash, layer) =>
        arr = $.v.map @objectsByLayer[layer], (id, object) ->
          pos = object.$elem.position()
          return {
            name: object.name
            x: pos.x
            y: pos.y
          }
        hash[layer] = arr
        return hash
      , {}
      localStorage.setItem('editor.map', JSON.stringify(data))

    _initMapGrid: ->
      # create the grid pattern that backgrounds the map
      canvas = require('game.canvas').create(16, 16)
      ctx = canvas.getContext()
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(16, 0.5)
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(0.5, 16)
      ctx.stroke()
      mapGrid = canvas

      @$mapGrid = $('#editor-map-grid')
        .css('background-image', "url(#{mapGrid.element.toDataURL()})")
        .css('background-repeat', 'repeat')

    _initBounds: ->
      offset = @$elem.offset()
      @bounds = require('game.Bounds').rect(
        offset.left,
        offset.top,
        offset.width,
        offset.height
      )

    _addEventsToMapObjects: ($draggees) ->
      evtns = 'editor.viewport.layer-tiles.tool-normal'
      $draggees.bind "mouseupnodrag.#{evtns}", (evt) ->
        console.log "#{evtns}: map object mouseupnodrag"
        $draggee = $(this)
        state = $draggee.attr('data-is-selected')
        newstate = if state is 'no' or !state then 'yes' else 'no'
        $draggee.attr('data-is-selected', newstate)
      # CS bug #2221 regarding indentation
      $draggees.dragObject
        dropTarget: @$elem
        containWithinDropTarget: true

    _removeEventsFromMapObjects: ($draggees) ->
      evtns = 'editor.viewport.layer-tiles.tool-normal'
      $draggees
        .dragObject('destroy')
        .unbind(".#{evtns}")

    _roundCoordsToGrid: (p) ->
      x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(p.y / GRID_SIZE) * GRID_SIZE

    _mouseWithinViewport: (evt) ->
      @bounds.x1 <= evt.pageX <= @bounds.x2 and
      @bounds.y1 <= evt.pageY <= @bounds.y2


define 'editor.viewport', ->
  meta = require('meta')
  require('editor.DropTarget')

  GRID_SIZE = 16

  meta.def
    init: (@core) ->
      @keyboard = @core.keyboard

      @$elem = $('#editor-viewport')
      @$map = $('#editor-map')
      @_initMapOverlay()
      @$mapLayers = $('#editor-map-layers')
      @_initBounds()
      @map = null
      @objectsByLayer = $.v.reduce @core.getLayers(), ((h, n) -> h[n] = {}; h), {}
      @objectId = 0
      @fills = []
      return this

    getElement: -> @$elem

    getMapLayers: -> @$mapLayers

    getContentForLayer: (layer) ->
      @$mapLayers.find(".editor-layer[data-layer=#{layer}] .editor-layer-content")

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
          layers = JSON.parse(data)
          for layer in ['tiles']
            $.v.each layers[layer], (o) =>
              object = @core.objectsByName[o.name]
              $elem = object.$elem.clone()
              $elem.addClass('editor-map-object')
              $elem.css('left', "#{o.x}px")
              $elem.css('top', "#{o.y}px")
              @core.findLayer(layer).find('.editor-layer-content').append($elem)
              @addObject(layer, $elem, object)
          for fill in layers['fill']
            @_loadFill(fill)
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
        .bind "keyup.#{evtns}", (evt) =>
          if @keyboard.isKeyPressed(evt, 'backspace', 'delete')
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

      dragStarted = false
      mouseDownAt = null
      activeSelections = []
      currentSelection = null

      clearActiveSelections = =>
        activeSelections = []
        # selection.$box.remove() does not work for some reason
        @$mapOverlay.find('.editor-selection-box').remove()

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
        .bind "contextmenu.#{evtns}", (evt) =>
          # prevent the context menu from coming up
          evt.preventDefault()

        .bind "mousedown.#{evtns}", (evt) =>
          # don't open a selection box accidentally if the map is right-clicked
          # or ctrl-clicked
          if evt.button is 2 or (evt.ctrlKey and evt.button is 0)
            return

          evt.preventDefault()

          addNewSelection = evt.altKey
          selectionStartedAt = @_roundCoordsToGrid(
            adjustCoords(x: evt.pageX, y: evt.pageY)
          )

          @$elem.bind "mousemove.#{evtns}", (evt) =>
            evt.preventDefault()

            # TODO: Can we use our dnd code to detect this?
            # Maybe define a 'dragSurface' plugin?
            unless dragStarted
              clearActiveSelections() unless addNewSelection
              selectionEvents.remove()
              currentSelection = {}
              currentSelection.pos = selectionStartedAt
              currentSelection.$box = $('<div class="editor-selection-box">')
              @$mapOverlay.append(currentSelection.$box)
              dragStarted = true

            mouse = @_roundCoordsToGrid(
              adjustCoords(x: evt.pageX, y: evt.pageY)
            )
            if mouse.x < currentSelection.pos.x
              # cursor is left of where the currentSelection started
              x = mouse.x
              w = currentSelection.pos.x - mouse.x
            else
              # cursor is right of where the currentSelection started
              x = currentSelection.pos.x
              w = mouse.x - currentSelection.pos.x
            if mouse.y < currentSelection.pos.y
              # cursor is above where the currentSelection started
              y = mouse.y
              h = currentSelection.pos.y - mouse.y
            else
              # cursor is below where the currentSelection started
              y = currentSelection.pos.y
              h = mouse.y - currentSelection.pos.y

            $.extend(currentSelection, {x, y, w, h})

            if w is 0 and h is 0
              # cursor is where the currentSelection started, don't draw the box
              currentSelection.$box.hide()
            else
              # draw the box
              currentSelection.$box
                .show()
                .moveTo({x, y})
                .size(w: w-1, h: h-1)

        .delegate '.editor-selection-box', "mousedown.#{evtns}", (evt) ->
          console.log 'selection box mousedown'
          evt.preventDefault()
          selectionEvents.remove()

        .delegate '.editor-selection-box', "mouseup.#{evtns}", (evt) ->
          console.log 'selection box mouseup'
          evt.preventDefault()
          # delay the re-addition of the mouseup event ever so slightly
          # otherwise it gets fired immediately (since we're in the mouseup
          # event ourselves)
          setTimeout selectionEvents.add, 0

        .bind "mouseup.#{evtns}", (evt) =>
          @$elem.unbind "mousemove.#{evtns}"
          mouseDownAt = null
          activeSelections.push(currentSelection) if (
            currentSelection and
            currentSelection.w > 0 and currentSelection.h > 0
          )
          currentSelection = null
          dragStarted = false
          # delay the re-addition of the mouseup event ever so slightly
          # otherwise it gets fired immediately (since we're in the mouseup
          # event ourselves)
          setTimeout selectionEvents.add, 0

      $(window)
        .bind "keyup.#{evtns}", (evt) =>
          Bounds = require('game.Bounds')
          # TODO: Make this Cmd-Backspace
          if @keyboard.isKeyPressed(evt, 'F')
            # fill all of the selections
            $.v.each activeSelections, (sel) =>
              fill = {x: sel.x, y: sel.y, w: sel.w, h: sel.h, color: '#800000'}
              @_loadFill(fill)
            @saveMap()

      selectionEvents.add()

    deactivate_fill_select_tool: ->
      evtns = 'editor.viewport.layer-fill.tool-select'
      @$elem.unbind(".#{evtns}")
      $(window).unbind(".#{evtns}")

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

    _createFill: (fill) ->
      $fill = $('<div class="editor-fill"></div>')
        .position(fill)
        .size(fill)
        .css('background-color', fill.color)

    _addFill: (fill) ->
      @fills.push(fill)

    _loadFill: (fill) ->
      $fill = @_createFill(fill)
      @getContentForLayer('fill').append($fill)
      @_addFill(fill)

    saveMap: ->
      console.log 'viewport: saving map...'
      layers = {}
      for layer in ['tiles']
        layers[layer] = []
        for id, object of @objectsByLayer[layer]
          pos = object.$elem.position()
          layers[layer].push({
            name: object.name
            x: pos.x
            y: pos.y
          })
      layers['fill'] = []
      for fill in @fills
        layers['fill'].push(fill)
      localStorage.setItem('editor.map', JSON.stringify(layers))

    _initMapOverlay: ->
      # create the grid pattern that backgrounds the map
      canvas = require('game.canvas').create(GRID_SIZE, GRID_SIZE)
      ctx = canvas.getContext()
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(GRID_SIZE, 0.5)
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(0.5, GRID_SIZE)
      ctx.stroke()
      mapOverlay = canvas

      @$mapOverlay = $('#editor-map-overlay')
        .css('background-image', "url(#{mapOverlay.element.toDataURL()})")
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

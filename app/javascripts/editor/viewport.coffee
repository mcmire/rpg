
define 'editor.viewport', ->
  meta = require('meta')
  util = require('util')
  Bounds = require('game.Bounds')

  DRAG_SNAP_GRID_SIZE = 16

  meta.def
    init: (@core) ->
      @$element = $('#editor-viewport')
      offset = @$element.offset()
      @bounds = Bounds.rect(offset.left, offset.top, offset.width, offset.height)
      @map = null
      @objects = []
      return this

    setWidth: (width) ->
      @$element.width(width)
      @bounds.setWidth(width)

    setHeight: (height) ->
      @$element.height(height)
      @bounds.setHeight(height)

    rememberDragObject: ([@$elemBeingDragged, @objectBeingDragged]) ->
      @$map.append(@$elemBeingDragged)

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
        # XXX: This is never getting fired... seems the drag helper is blocking
        # it somehow.... why????
        .one 'mouseup.editor.viewport', (evt) =>
          console.log 'viewport mouseup'
          if @$elemBeingDragged
            @$map.trigger 'mousedrop.editor.viewport', evt
          # evt.preventDefault()

        .bind 'mousedragover.editor.viewport', (evt) =>
          console.log 'viewport mousedragover'
          @rememberDragObject(@core.forgetDragObject())
          @$elemBeingDragged.removeClass('drag-helper')

        .bind 'mousedrag.editor.viewport', (evt) =>
          # console.log 'viewport drag'
          $elem = @$elemBeingDragged
          x = evt.pageX - @core.dragOffset.x - @map.x1 - @bounds.x1
          y = evt.pageY - @core.dragOffset.y - @map.y1 - @bounds.y1
          $elem.css('top', "#{y}px").css('left', "#{x}px")

        .bind 'mousedragout.editor.viewport', (evt) =>
          console.log 'viewport mousedragout'
          @$elemBeingDragged.addClass('drag-helper')
          @core.rememberDragObject(@forgetDragObject())
          # prevent a jump when dragging an object back out of the viewport
          @core.positionDragHelper(evt)

        # XXX: This is never getting fired... seems the drag helper is blocking
        # it somehow.... why????
        .bind 'mousedrop.editor.viewport', (evt) =>
          console.log 'viewport drop'
          $elem = @$elemBeingDragged
          x = parseInt($elem.css('left'), 10)
          y = parseInt($elem.css('top'), 10)
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          $elem.css('top', "#{y}px").css('left', "#{x}px")
          @addObject(@$elemBeingDragged, @objectBeingDragged)
          @forgetDragObject(false)

    unbindDragEvents: ->
      console.log 'removing drag events from viewport'
      $(window).unbind 'mousemove.editor.viewport'
      @$map.unbind 'mousedragover.editor.viewport'
      @$map.unbind 'mousedrag.editor.viewport'
      @$map.unbind 'mousedragout.editor.viewport'
      @$map.unbind 'mousedrop.editor.viewport'

    newMap: ->
      # create the grid pattern that backgrounds the map
      canvas = require('game.canvas').create(16, 16)
      ctx = canvas.getContext()
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(16, 0.5)
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(0.5, 16)
      ctx.stroke()

      @map = Bounds.rect(0, 0, 1024, 1024)

      mouse = null
      dragEntered = null
      @$elemBeingDragged = null
      @objectBeingDragged = null

      @$map = $map = $('<div class="editor-map"/>')
        .css('width', @map.width)
        .css('height', @map.height)
        .css('background-image', "url(#{canvas.element.toDataURL()})")
        .css('background-repeat', 'repeat')

      @$map
        .bind 'mousedown.editor.viewport', (evt) =>
          # don't pan the map accidentally if it is right-clicked
          return if evt.button is 2

          # previous mouse position
          mouse =
            px:  evt.pageX
            py:  evt.pageY

          $map.css('cursor', 'move')

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
              $map.css('cursor', 'auto')
              mouse = null
            $(window).unbind 'mousemove.editor.viewport'

      @$element.append($map)

    addObject: ($elem, object) ->
      console.log 'addObject'
      obj = {'$elem': $elem}
      obj[k] = v for k, v of object
      @objects.push(obj)
      dragStarted = false
      dragOffset = null
      obj.$elem
        .unbind('.editor')
        .removeClass('drag-helper')

        .bind 'mousedown.editor.viewport', (evt) =>
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
            return true

        .bind 'mousedragstart.editor.viewport', (evt) =>
          offset = $elem.offset()
          dragOffset =
            x: evt.pageX - offset.left
            y: evt.pageY - offset.top

        .bind 'mousedrag.editor.viewport', (evt) =>
          # remove snapping
          x = evt.pageX - dragOffset.x - @map.x1 - @bounds.x1
          y = evt.pageY - dragOffset.y - @map.y1 - @bounds.y1
          $elem.css('top', "#{y}px").css('left', "#{x}px")

        .bind 'mousedragend.editor.viewport', (evt) =>
          # apply snapping
          x = parseInt($elem.css('left'), 10)
          y = parseInt($elem.css('top'), 10)
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          $elem.css('top', "#{y}px").css('left', "#{x}px")
          $(window).unbind 'mousemove.editor.viewport'

    stealFrom: (obj, prop) ->
      @[prop] = obj.delete(prop)

    giveTo: (obj, prop) ->
      obj[prop] = @delete(prop)

    delete: (prop) ->
      val = @[prop]
      delete @[prop]
      return val

    _mouseWithinViewport: (evt) ->
      @bounds.x1 <= evt.pageX <= @bounds.x2 and
      @bounds.y1 <= evt.pageY <= @bounds.y2

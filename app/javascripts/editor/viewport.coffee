
define 'editor.viewport', ->
  meta = require('meta')
  util = require('util')

  DRAG_SNAP_GRID_SIZE = 16

  meta.def
    init: (@core) ->
      @$element = $('#editor-viewport')
      @_recalculateBounds()
      @objects = []
      return this

    _recalculateBounds: ->
      offset = @$element.offset()
      @bounds = require('game.Bounds').rect(
        offset.left,
        offset.top,
        offset.width,
        offset.height
      )

    setHeight: (height) ->
      @$element.height(height)
      @_recalculateBounds()

    setWidth: (width) ->
      @$element.width(width)
      @_recalculateBounds()

    rememberDragObject: ([@$elemBeingDragged, @objectBeingDragged]) ->
      @$element.append(@$elemBeingDragged)

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
          @$elemBeingDragged.addClass('in-viewport')

        .bind 'mousedrag.editor.viewport', (evt) =>
          console.log 'viewport drag'
          x = Math.round(evt.pageX - (@objectBeingDragged.dims.w/2)) - @bounds.x1
          y = Math.round(evt.pageY - (@objectBeingDragged.dims.h/2)) - @bounds.y1
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          @$elemBeingDragged.css('top', "#{y}px").css('left', "#{x}px")

        .bind 'mousedragout.editor.viewport', (evt) =>
          console.log 'viewport mousedragout'
          @$elemBeingDragged.removeClass('in-viewport')
          @core.rememberDragObject(@forgetDragObject())
          @core.positionDragHelper(evt)

        # XXX: This is never getting fired... seems the drag helper is blocking
        # it somehow.... why????
        .one 'mousedrop.editor.viewport', (evt) =>
          console.log 'viewport drop'
          @$elemBeingDragged.unbind('.editor')
          @$elemBeingDragged.removeAttr('id')
          @addObject(@objectBeingDragged)
          @forgetDragObject(false)

    unbindDragEvents: ->
      $(window).unbind 'mousemove.editor.viewport'
      @$map.unbind 'mousedragover.editor.viewport'
      @$map.unbind 'mousedrag.editor.viewport'
      @$map.unbind 'mousedragout.editor.viewport'

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

      mouse = null
      map = null
      width = 1024
      height = 1024
      dragEntered = null
      @$elemBeingDragged = null
      @objectBeingDragged = null

      @$map = $map = $('<div class="editor-map"/>')
        .css('width', width)
        .css('height', height)
        .css('background-image', "url(#{canvas.element.toDataURL()})")
        .css('background-repeat', 'repeat')

        .bind 'mousedown.editor.viewport', (evt) =>
          # don't pan the map accidentally if it is right-clicked
          return if evt.button is 2

          # previous mouse position
          mouse =
            px:  evt.pageX
            py:  evt.pageY
          # current map position
          map =
            x: parseInt($map.css('left'), 10)
            y:  parseInt($map.css('top'), 10)

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

            mapX = map.x + dx
            mapX = 0 if mapX > 0
            w = -(width - @bounds.width)
            mapX = w if mapX < w

            mapY = map.y + dy
            mapY = 0 if mapY > 0
            h = -(height - @bounds.height)
            mapY = h if mapY < h

            $map.css("left", "#{mapX}px")
            $map.css("top", "#{mapY}px")
            map.x = mapX
            map.y = mapY

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

    addObject: (object) ->
      @objects.push(object)

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

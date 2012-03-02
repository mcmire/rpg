
define 'editor.viewport', ->
  meta = require('meta')
  util = require('util')

  meta.def
    init: (@core) ->
      @$viewport = $('#editor-viewport')
      @width = @$viewport.width()
      @height = @$viewport.height()
      # @bounds = require('game.Bounds').rect(0, 0, @width, @height)
      return this

    setHeight: (height) ->
      @height = height
      @$viewport.height(height)

    setWidth: (width) ->
      @width = width
      @$viewport.width(width)

    # setMap: (currentMap) ->
    #   @currentMap = map
    #   map.setParent(this)
    #   map.attach()

    # unsetMap: ->
    #   @currentMap.detach()

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
      $map = $('<div class="editor-map"/>')
        .css('width', width)
        .css('height', height)
        .css('background-image', "url(#{canvas.element.toDataURL()})")
        .css('background-repeat', 'repeat')

        .bind 'mousedown.editor', (evt) =>
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

          # bind a new mousemove only on mousedown so that when the user is just
          # gliding over the map (not dragging), we are not firing mousemove
          # events unnecessarily
          $map.bind 'mousemove.editor', (evt) =>
            x = evt.pageX
            y = evt.pageY

            # allow the user to drag the map in order to pan around, but do not
            # allow the user to pan past the bounds of the map

            dx = x - mouse.px
            dy = y - mouse.py

            mapX = map.x + dx
            mapX = 0 if mapX > 0
            w = -(width - @width)
            mapX = w if mapX < w

            mapY = map.y + dy
            mapY = 0 if mapY > 0
            h = -(height - @height)
            mapY = h if mapY < h

            $map.css("left", "#{mapX}px")
            $map.css("top", "#{mapY}px")
            map.x = mapX
            map.y = mapY

            mouse.px = x
            mouse.py = y

            # prevent selection
            evt.stopPropagation()
            evt.preventDefault()

          # prevent anything that may occur on mousedown
          evt.stopPropagation()
          evt.preventDefault()

        .bind 'mouseup.editor', (evt) ->
          $map.css('cursor', 'auto')
          $map.unbind('mousemove.editor')
          mouse = null
          evt.stopPropagation()
          evt.preventDefault()

      @$viewport.append($map)

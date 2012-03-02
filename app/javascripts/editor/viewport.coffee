
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
      stuck = null
      $map = $('<div class="editor-map"/>')
        .css('width', width)
        .css('height', height)
        .css('background-image', "url(#{canvas.element.toDataURL()})")
        .css('background-repeat', 'repeat')

        .bind 'mousedown.editor', (evt) =>
          return if evt.button is 2  # right-click

          mouse =
            px:  evt.pageX
            py:  evt.pageY
            # dx: 0
            # dy: 0
            # pvx: 0
            # pvy: 0
          map =
            top:  parseInt($map.css('top'), 10)
            left: parseInt($map.css('left'), 10)

          $map.css('cursor', 'move')

          $map.bind 'mousemove.editor', (evt) =>
            x = evt.pageX
            y = evt.pageY

            # if we hit the edge of the map, then further mouse movements in
            # the same direction should not be recorded, so that moving the
            # mouse in the opposite direction moves the map again instead of the
            # user having to move the mouse past the original location the mouse
            # got "stuck" on

            # if stuck
            #   vx = util.cmp(x, stuck.x)
            #   vy = util.cmp(y, stuck.y)
            #   if stuck.vx and stuck.vy and vx != stuck.vx or vy != stuck.vy
            #     mouse.px = x
            #     mouse.py = y
            #     stuck = null

            dx = x - mouse.px
            dy = y - mouse.py
            # mouse.dx = dx
            # mouse.dy = dy
            # vx = switch
            #   when dx > 0 then +1
            #   when dx < 0 then -1
            #   else              0
            # vy = switch
            #   when dy > 0 then +1
            #   when dy < 0 then -1
            #   else              0
            top = map.top + dy
            top = 0 if top > 0
            h = -(height - @height)
            top = h if top < h
            left = map.left + dx
            left = 0 if left > 0
            w = -(width - @width)
            left = w if left < w
            # if top <= 0 and left <= 0 and top > -(height - @height) and left > -(width - @width)
            $map.css("top", "#{top}px")
            $map.css("left", "#{left}px")
            map.top = top
            map.left = left
            # else
            #   stuck ||= {x: x, y: y, vx: vx, vy: vy}

            mouse.px = x
            mouse.py = y

            # mouse.pvx = vx
            # mouse.pvy = vy

            evt.stopPropagation()
            evt.preventDefault()

          evt.stopPropagation()
          evt.preventDefault()

        .bind 'mouseup.editor', (evt) ->
          $map.css('cursor', 'auto')
          $map.unbind('mousemove.editor')
          # map.top = parseInt($map.css('top'), 10)
          # map.left = parseInt($map.css('left'), 10)
          mouse = null
          evt.stopPropagation()
          evt.preventDefault()

      @$viewport.append($map)

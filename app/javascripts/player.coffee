define (require) ->
  util = require('app/util')
  Mob = require('app/mob')
  {eventable} = require('app/roles')
  keyboard = require('app/keyboard')

  DIRECTIONS = 'up down left right'.split(' ')

  DIRECTION_KEYS =
    up:    keyboard.keyCodesFor('KEY_W', 'KEY_UP',    'KEY_K')
    down:  keyboard.keyCodesFor('KEY_S', 'KEY_DOWN',  'KEY_J')
    left:  keyboard.keyCodesFor('KEY_A', 'KEY_LEFT',  'KEY_H')
    right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT', 'KEY_L')

  KEY_DIRECTIONS = {}
  for dir in DIRECTIONS
    for keyCode in DIRECTION_KEYS[dir]
      KEY_DIRECTIONS[keyCode] = dir

  KEYS = $.flatten($.values(DIRECTION_KEYS))

  # TODO: Make this a singleton
  Player = Mob.extend 'game.Player',
    eventable,

    statics:
      image: 'link2x.gif'
      width: 34
      height: 48
      speed: 4  # px/frame

    members:
      __plugged__: (core) ->
        core.collisionLayer.add(this)

      init: (core) ->
        @viewportPadding = 30  # pixels
        @_super(core)
        @keyTracker = new keyboard.KeyTracker(KEYS)
        @addEvents()     # shouldn't core, like, do this automatically?
        @setState('idleRight')

      # override
      _initFence: ->
        @fence = @viewport.bounds.withScale(@viewportPadding)

      # override
      addEvents: ->
        keyboard.addKeyTracker(@keyTracker)

      # override
      removeEvents: ->
        keyboard.removeKeyTracker(@keyTracker)

      # Respond to keystrokes executed during the "dead time", i.e., the time
      # between the end of the last iteration and the start of this iteration
      predraw: ->
        if keyCode = @keyTracker.getLastPressedKey()
          direction = KEY_DIRECTIONS[keyCode]
          state = 'move' + util.capitalize(direction)
        else
          state = @state.name.replace('move', 'idle')
        if state isnt @state.name
          @setState(state)

        @_super()

      # Internal: Move the position of the player leftward, possibly shifting the
      # viewport to keep the player within it, and also keeping the player from
      # moving beyond the edges of the map and intersecting solid parts of the map
      # and entities moving about.
      #
      # The idea here is that we move the player left within the viewport until it
      # reaches a certain distance away from its left edge -- we say it reaches the
      # fence. When this occurs, we continue the appearance of movement by keeping
      # the player on-screen at the fence and scrolling the viewport leftward over
      # the map. We do this until we've reached the left edge of the map and can
      # scroll no further, at which point we move the player left until it touches
      # the left edge of the map.
      #
      moveLeft: ->
        nextBoundsOnMap = @bounds.onMap.withTranslation(x: -@speed)

        # Would the player hit the right edge of a collision box?
        if x = @allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)
          # Yes: move it just at the edge so it no longer collides
          @bounds.onMap.translateBySide('x1', x)
          return

        # Would the viewport move beyond the left edge of the map?
        if (@viewport.bounds.x1 - @speed) < 0
          # Yes: put it at the edge
          @viewport.translateBySide('x1', 0)
          # Would the player move beyond the left edge of the map?
          if nextBoundsOnMap.x1 < 0
            # Yes: put it at the edge
            @bounds.onMap.translateBySide('x1', 0)
          else
            # No: Move the player left
            @bounds.onMap.translate(x: -@speed)
        else
          # No: Move the player left
          @bounds.onMap.translate(x: -@speed)
          # Would the player move beyond the left edge of the fence?
          if (@bounds.inViewport.x1 - @speed) < @fence.x1
            # Yes: shift viewport left by @speed.
            #
            # This is not so straightforward as one might think because if the
            # player is less than @speed distance away from the left edge then the
            # viewport needs to shift in such a way as to show the player
            # accurately within the viewport.
            #
            # For example, assuming player.bounds.fence.x1 = 10 and:
            #
            #   player.bounds.inViewport.x1 = 14
            #   player.bounds.onMap.x1 = 114
            #   viewport.bounds.x1 = 100
            #
            # which you can visualize as:
            #
            #   map          100       110
            #   view         0   4     10  14
            #                |         |
            #                |   x-----|---o
            #
            # we need to move the player and the viewport bounds so that it looks
            # like this:
            #
            #   map    94    100 104   110
            #   view   0     :   10    :
            #          |     :   |     :
            #          |     :   x     :
            #
            # or, in code, this needs to be true:
            #
            #   player.bounds.inViewport.x1 = 10
            #   player.bounds.onMap.x1 = 104
            #   viewport.bounds.x1 = 94
            #
            distanceFromFence = @bounds.inViewport.x1 - @fence.x1
            @viewport.translate(x: -(@speed - distanceFromFence))

      # Internal: Move the player rightward.
      #
      # This is very similar to #moveLeft so see that for more.
      #
      moveRight: ->
        nextBoundsOnMap = @bounds.onMap.withTranslation(x: @speed)

        # Would the player hit the left edge of a collision box?
        if x = @allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)
          # Yes: move it just at the edge so it no longer collides
          @bounds.onMap.translateBySide('x2', x)
          return

        mapWidth = @map.width

        # Would the viewport move beyond the right edge of the map?
        if (@viewport.bounds.x2 + @speed) > mapWidth
          # Yes: put it at the edge
          @viewport.translateBySide('x2', mapWidth)
          # Would the player move beyond the right edge of the map?
          if nextBoundsOnMap.x2 > mapWidth
            # Yes: put it at the edge
            @bounds.onMap.translateBySide('x2', mapWidth)
          else
            # No: Move the player right
            @bounds.onMap.translate(x: @speed)
        else
          # No: Move the player right
          @bounds.onMap.translate(x: @speed)
          # Would the player move beyond the right edge of the fence?
          if (@bounds.inViewport.x2 + @speed) > @fence.x2
            # Yes: shift viewport right by @speed.
            # See #moveLeft for more commentary here.
            distanceFromFence = @fence.x2 - @bounds.inViewport.x2
            @viewport.translate(x: @speed - distanceFromFence)

      # Internal: Move the player upward.
      #
      # This is very similar to #moveLeft so see that for more.
      #
      moveUp: ->
        nextBoundsOnMap = @bounds.onMap.withTranslation(y: -@speed)

        # Would the player hit the bottom edge of a collision box?
        if y = @allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)
          # Yes: move it just at the edge so it no longer collides
          @bounds.onMap.translateBySide('y1', y)
          return

        # Would the viewport move beyond the top edge of the map?
        if (@viewport.bounds.y1 - @speed) < 0
          # Yes: put it at the edge
          @viewport.translateBySide('y1', 0)
          # Would the player move beyond the top edge of the map?
          if nextBoundsOnMap.y1 < 0
            # Yes: put it at the edge
            @bounds.onMap.translateBySide('y1', 0)
          else
            # No: Move the player up
            @bounds.onMap.translate(y: -@speed)
        else
          # No: Move the player up
          @bounds.onMap.translate(y: -@speed)
          # Would the player move beyond the top edge of the fence?
          if (@bounds.inViewport.y1 - @speed) < @fence.y1
            # Yes: shift viewport right by @speed.
            # See #moveLeft for more commentary here.
            distanceFromFence = @bounds.inViewport.y1 - @fence.y1
            @viewport.translate(y: -(@speed - distanceFromFence))

      # Internal: Move the player downward.
      #
      # This is very similar to #moveLeft so see that for more.
      #
      moveDown: ->
        nextBoundsOnMap = @bounds.onMap.withTranslation(y: @speed)

        # Would the player hit the top edge of a collision box?
        if y = @allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)
          # Yes: move it just at the edge so it no longer collides
          @translateBySide('y2', y)
          return

        mapHeight = @map.height

        # Would the viewport move beyond the right edge of the map?
        if (@viewport.bounds.y2 + @speed) > mapHeight
          # Yes: put it at the edge
          @viewport.translateBySide('y2', mapHeight)
          # Would the player move beyond the bottom edge of the map?
          if nextBoundsOnMap.y2 > mapHeight
            # Yes: put it at the edge
            @bounds.onMap.translateBySide('y2', mapHeight)
          else
            # No: Move the player down
            @bounds.onMap.translate(y: @speed)
        else
          # No: Move the player right
          @bounds.onMap.translate(y: @speed)
          # Would the player move beyond the right edge of the fence?
          if (@bounds.inViewport.y2 + @speed) > @fence.y2
            # Yes: shift viewport right by @speed.
            # See #moveLeft for more commentary here.
            distanceFromFence = @fence.y2 - @bounds.inViewport.y2
            @viewport.translate(y: @speed - distanceFromFence)

  Player.addState 'moveLeft',  duration: 2, frames: [0,1,2,3,4,5,6,7],       repeat: true, move: true
  Player.addState 'moveRight', duration: 2, frames: [8,9,10,11,12,13,14,15], repeat: true, move: true
  Player.addState 'moveDown',  duration: 2, frames: [16,17,18,19,20,21,22],  repeat: true, move: true
  Player.addState 'moveUp',    duration: 2, frames: [23,24,25,26,27,28],     repeat: true, move: true
  Player.addState 'idleLeft',  duration: 2, frames: [0],                     repeat: true
  Player.addState 'idleRight', duration: 2, frames: [8],                     repeat: true
  Player.addState 'idleDown',  duration: 2, frames: [19],                    repeat: true
  Player.addState 'idleUp',    duration: 2, frames: [23],                    repeat: true

  return Player

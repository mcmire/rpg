common = (window.common ||= {})
util = common.util
{eventable} = common.roles

game = (window.game ||= {})

keyboard = game.keyboard
LiveObject = game.LiveObject

DIRECTIONS = 'up down left right'.split(' ')

# TODO: Probably can move these shortcuts into keyboard
DIRECTION_KEYS =
  up:    keyboard.keyCodesFor('KEY_W', 'KEY_UP')
  down:  keyboard.keyCodesFor('KEY_S', 'KEY_DOWN')
  left:  keyboard.keyCodesFor('KEY_A', 'KEY_LEFT')
  right: keyboard.keyCodesFor('KEY_D', 'KEY_RIGHT')

KEY_DIRECTIONS = {}
for dir in DIRECTIONS
  for keyCode in DIRECTION_KEYS[dir]
    KEY_DIRECTIONS[keyCode] = dir

KEYS = $.flatten($.values(DIRECTION_KEYS))

player = LiveObject.cloneAs('game.player')

player.extend \
  eventable,

  viewportPadding: 30
  keyTracker: keyboard.KeyTracker.create(KEYS)

  # override
  addEvents: ->
    keyboard.addKeyTracker(@keyTracker)

  # override
  removeEvents: ->
    keyboard.removeKeyTracker(@keyTracker)

  activate: ->
    @setState('idleRight')
    @addEvents()

  deactivate: ->
    @removeEvents()

  # draw: (ctx) ->
  #   b = @mbounds
  #   ctx.strokeStyle = '#ff0000'
  #   ctx.strokeRect(b.x1+0.5, b.y1+0.5, @width-0.5, @height-0.5)
  #   @_super(ctx)

  # Respond to keystrokes executed during the "dead time", i.e., the time
  # between the end of the last iteration and the start of this iteration
  predraw: (ctx) ->
    @_super(ctx)

    if keyCode = @keyTracker.getLastPressedKey()
      direction = KEY_DIRECTIONS[keyCode]
      state = 'move' + util.capitalize(direction)
    else
      state = @currentState.name.replace('move', 'idle')
    if state isnt @currentState.name
      # console.log "player: setting state to #{state}"
      @setState(state)

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
    # Calculate next position of the player moving left
    nextBoundsOnMap = @mbounds.withTranslation(x: -@speed)

    # Would the player cross the right edge of a collision box?
    if x = @mapCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)
      # Yes: Move it just at the edge so it no longer collides
      @doToMapBounds('translateBySide', 'x1', x)
      return

    # Would the viewport move beyond the left edge of the map?
    if (@viewport.bounds.x1 - @speed) < 0
      # Yes: Is there another map to load to the left?
      if map = @map.getAreaLeft?()
        # Yes: Load it
        @map.loadArea(map)
      else
        # No: Put the viewport at the left edge of the map
        @viewport.translateBySide('x1', 0)
        # Would the player cross the left edge of the map?
        if nextBoundsOnMap.x1 < 0
          # Yes: put it at the edge
          @doToMapBounds('translateBySide', 'x1', 0)
        else
          # No: Move the player right
          @doToMapBounds('replace', nextBoundsOnMap)
    else
      # The viewport is still within the map
      # Move the player left
      @doToMapBounds('replace', nextBoundsOnMap)
      # Would the player cross the left edge of the fence?
      if (@vbounds.x1 - @speed) < @fence.x1
        # Yes: Shift viewport left.
        #
        # This is not so straightforward as one might think because if the
        # player is less than @speed distance away from the left edge then the
        # viewport needs to shift in such a way as to show the player
        # @viewportPadding distance away from the left edge of the viewport.
        #
        # For example, assuming player.bounds.fence.x1 = 10 and:
        #
        #   player.vbounds.x1 = 14
        #   player.mbounds.x1 = 114
        #   viewport.bounds.x1 = 100
        #
        # moving the player 10 pixels to the left looks like (o is the current
        # x1 of the player, x is the new x1 position):
        #
        #   map          100 104   110 114
        #   view         0   4     10  14
        #                |         |
        #                |   x-----|---o
        #
        # and so we need to move the viewport bounds so that it looks like
        # this:
        #
        #   map    94    100 104   110
        #   view   0     :   10    :
        #          |     :   |     :
        #          |     :   x     :
        #
        # or, in code, this needs to be true:
        #
        #   player.vbounds.x1 = 10
        #   player.mbounds.x1 = 104
        #   viewport.bounds.x1 = 94
        #
        @viewport.translateBySide('x1', @mbounds.x1 - @viewportPadding)

  # Internal: Move the player rightward.
  #
  # This is very similar to #moveLeft so see that for more.
  #
  moveRight: ->
    # Calculate next position of the player moving right
    nextBoundsOnMap = @mbounds.withTranslation(x: +@speed)

    # Would the player cross the left edge of a collision box?
    if x = @mapCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)
      # Yes: Move it just at the edge so it no longer collides
      @doToMapBounds('translateBySide', 'x2', x)
      return

    mapWidth = @map.width

    # Would the viewport move beyond the right edge of the map?
    if (@viewport.bounds.x2 + @speed) > mapWidth
      # Yes: Is there another map to load to the right?
      if map = @map.getAreaRight?()
        # Yes: Load it
        @map.loadArea(map)
      else
        # No: Put the viewport at the right edge of the map
        @viewport.translateBySide('x2', mapWidth)
        # Would the player cross the right edge of the map?
        if nextBoundsOnMap.x2 > mapWidth
          # Yes: put it at the edge
          @doToMapBounds('translateBySide', 'x2', mapWidth)
        else
          # No: Move the player right
          @doToMapBounds('replace', nextBoundsOnMap)
    else
      # The viewport is still within the map
      # No: Move the player right
      @doToMapBounds('replace', nextBoundsOnMap)
      # Would the player cross the right edge of the fence?
      if (@vbounds.x2 + @speed) > @fence.x2
        # Yes: shift viewport right.
        @viewport.translateBySide('x2', @mbounds.x2 + @viewportPadding)

  # Internal: Move the player upward.
  #
  # This is very similar to #moveLeft so see that for more.
  #
  moveUp: ->
    # Calculate the next position of the player moving up
    nextBoundsOnMap = @mbounds.withTranslation(y: -@speed)

    # Would the player cross the bottom edge of a collision box?
    if y = @mapCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)
      # Yes: move it just at the edge so it no longer collides
      @doToMapBounds('translateBySide', 'y1', y)
      return

    # Would the viewport move beyond the top edge of the map?
    if (@viewport.bounds.y1 - @speed) < 0
      # Yes: Is there another map to load to the top?
      if map = @map.getAreaUp?()
        # Yes: Load it
        @map.loadArea(map)
      else
        # No: Put the viewport at the top edge of the map
        @viewport.translateBySide('y1', 0)
        # Would the player cross the top edge of the map?
        if nextBoundsOnMap.y1 < 0
          # Yes: put it at the edge
          @doToMapBounds('translateBySide', 'y1', 0)
        else
          # No: Move the player up
          @doToMapBounds('replace', nextBoundsOnMap)
    else
      # The viewport is still within the map
      # Move the player up
      @doToMapBounds('replace', nextBoundsOnMap)
      # Would the player cross the top edge of the fence?
      if (@vbounds.y1 - @speed) < @fence.y1
        # Yes: shift viewport up.
        @viewport.translateBySide('y1', @mbounds.y1 - @viewportPadding)

  # Internal: Move the player downward.
  #
  # This is very similar to #moveLeft so see that for more.
  #
  moveDown: ->
    # Calculate the next position of the player moving down
    nextBoundsOnMap = @mbounds.withTranslation(y: @speed)

    # Would the player cross the top edge of a collision box?
    if y = @mapCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)
      # Yes: move it just at the edge so it no longer collides
      @translateBySide('y2', y)
      return

    mapHeight = @map.height

    # Would the viewport move beyond the bottom edge of the map?
    if (@viewport.bounds.y2 + @speed) > mapHeight
      # Yes: Is there another map to load to the bottom?
      if map = @map.getAreaDown?()
        # Yes: Load it
        @map.loadArea(map)
      else
        # No: Put the viewport at the bottom edge of the map
        @viewport.translateBySide('y2', mapHeight)
        # Would the player move beyond the bottom edge of the map?
        if nextBoundsOnMap.y2 > mapHeight
          # Yes: put it at the edge
          @doToMapBounds('translateBySide', 'y2', mapHeight)
        else
          # No: Move the player down
          @doToMapBounds('replace', nextBoundsOnMap)
    else
      # The viewport is still within the map
      # No: Move the player right
      @doToMapBounds('replace', nextBoundsOnMap)
      # Would the player move beyond the right edge of the fence?
      if (@vbounds.y2 + @speed) > @fence.y2
        # Yes: shift viewport right.
        @viewport.translateBySide('y2', @mbounds.y2 + @viewportPadding)

  # override
  # _initBoundsOnMap: ->
  #   @_super()
  #   @mbounds = game.Bounds.at(372, 540, 406, 588)

  # override
  _initFence: ->
    @fence = game.Bounds.rect(0, 0, game.viewport.width, game.viewport.height)
      .withScale(@viewportPadding)

# Go ahead and init the player, after all we will only have one instance hanging
# around
player.init('link2x', 34, 48)
player.speed = 4  # px/tick

player.addState 'moveLeft',  [0,1,2,3,4,5,6,7],       frameDuration: 2, doesRepeat: true, do: 'moveLeft'
player.addState 'moveRight', [8,9,10,11,12,13,14,15], frameDuration: 2, doesRepeat: true, do: 'moveRight'
player.addState 'moveDown',  [16,17,18,19,20,21,22],  frameDuration: 2, doesRepeat: true, do: 'moveDown'
player.addState 'moveUp',    [23,24,25,26,27,28],     frameDuration: 2, doesRepeat: true, do: 'moveUp'
player.addState 'idleLeft',  [0],                     frameDuration: 2, doesRepeat: true
player.addState 'idleRight', [8],                     frameDuration: 2, doesRepeat: true
player.addState 'idleDown',  [19],                    frameDuration: 2, doesRepeat: true
player.addState 'idleUp',    [23],                    frameDuration: 2, doesRepeat: true

game.player = player

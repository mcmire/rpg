game = (window.game ||= {})

meta = game.meta2
util = game.util
Grob = game.Grob

### FIXME ###

DIRECTIONS = 'right down left up'.split(' ')

Enemy = Grob.cloneAs('game.Enemy')

Enemy.addState 'moveDown',    [0,1],   frameDuration: 4,  do: 'moveDown',  doesRepeat: true
Enemy.addState 'moveRight',   [4,5],   frameDuration: 4,  do: 'moveRight', doesRepeat: true
Enemy.addState 'moveLeft',    [8,9],   frameDuration: 4,  do: 'moveLeft',  doesRepeat: true
Enemy.addState 'moveUp',      [12,13], frameDuration: 4,  do: 'moveUp',    doesRepeat: true
Enemy.addState 'upToLeft',    [12,14], frameDuration: 24, then: 'moveLeft'
Enemy.addState 'downToLeft',  [0,3],   frameDuration: 24, then: 'moveLeft'
Enemy.addState 'upToRight',   [12,15], frameDuration: 24, then: 'moveRight'
Enemy.addState 'downToRight', [0,2],   frameDuration: 24, then: 'moveRight'
Enemy.addState 'leftToUp',    [8,11],  frameDuration: 24, then: 'moveUp'
Enemy.addState 'rightToUp',   [4,6],   frameDuration: 24, then: 'moveUp'
Enemy.addState 'leftToDown',  [8,10],  frameDuration: 24, then: 'moveDown'
Enemy.addState 'rightToDown', [4,7],   frameDuration: 24, then: 'moveDown'

Enemy.extend
  # TODO: This should be moved to lightworld_map.addPlayer
  __plugged__: (core) ->
    core.collisionLayer.add(this)

  _directionChangeNeeded: false

  init: ->
    @_super('enemy2x.gif', 40, 56, 3)
    @setState('moveRight')
    @_chooseSequenceLength()

  # override
  _initFence: ->
    @fence = game.Bounds.rect(100, 100, 300, 300)

  # override
  _initBoundsOnMap: ->
    @_super()
    self = this
    fn = ->
      x1 = util.randomInt(self.fence.x1, self.fence.x2)
      y1 = util.randomInt(self.fence.y1, self.fence.y2)
      self.bounds.onMap.anchor(x1, y1)
    fn()
    # poor man's do-while :(
    if @collisionLayer
      fn() while @collisionLayer.collidables.intersectsWith(@bounds.onMap)

  # Internal: Move the position of the entity leftward, keeping the entity from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and other entities moving about.
  #
  moveLeft: ->
    @direction = 'left'

    # Calculate next position of the mob moving left
    nextBoundsOnMap = @bounds.onMap.withTranslation(x: -@speed)

    # Would the mob hit the right edge of a collision box or the left edge
    # of the fence?
    x = (
      @allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap) or
      @fence.getInnerLeftEdgeBlocking(nextBoundsOnMap)
    )
    if x
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('x1', x)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # Internal: Move the position of the entity rightward, keeping the entity from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and other entities moving about.
  #
  moveRight: ->
    @direction = 'right'

    # Calculate next position of the mob moving right
    nextBoundsOnMap = @bounds.onMap.withTranslation(x: +@speed)

    # Would the mob hit the left edge of a collision box or the right edge of
    # the fence?
    x = (
      @allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap) or
      @fence.getInnerRightEdgeBlocking(nextBoundsOnMap)
    )
    if x
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('x2', x)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # Internal: Move the position of the entity upward, keeping the entity from
  # moving beyond the edges of the map and intersecting solid parts of the map
  # and other entities moving about.
  #
  moveUp: ->
    @direction = 'up'

    # Calculate next position of the mob moving up
    nextBoundsOnMap = @bounds.onMap.withTranslation(y: -@speed)

    # Would the mob hit the bottom edge of a collision box or the top edge of
    # the fence?
    y = (
      @allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap) or
      @fence.getInnerTopEdgeBlocking(nextBoundsOnMap)
    )
    if y
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('y1', y)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # Internal: Move the position of the entity downward, keeping the entity
  # from moving beyond the edges of the map and intersecting solid parts of
  # the map and other entities moving about.
  #
  moveDown: ->
    @direction = 'down'

    # Calculate next position of the mob moving down
    nextBoundsOnMap = @bounds.onMap.withTranslation(y: +@speed)

    # Would the player hit the top edge of a collision box or the bottom edge
    # of the fence?
    y = (
      @allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap) or
      @fence.getInnerBottomEdgeBlocking(nextBoundsOnMap)
    )
    if y
      # Yes: move it just at the edge so it no longer collides
      @bounds.onMap.translateBySide('y2', y)
      # Also choose another direction since we can't go any further
      @_directionChangeNeeded = true
    else
      # No: Move it normally
      @bounds.onMap.replace(nextBoundsOnMap)

  # draw: ->
  #   super
  #   fenceInViewport = @main.mapBoundsToViewportBounds(@fence)
  #   fenceInViewport.draw(@main)

  # override
  postdraw: (ctx) ->
    if @_directionChangeNeeded or @numSeqFrameDraws is @sequenceLength
      @_directionChangeNeeded = false
      @_chooseAnotherDirection()
    else
      @_super(ctx)

  _chooseAnotherDirection: ->
    validDirections = switch @direction
      when 'up', 'down'    then ['left', 'right']
      when 'left', 'right' then ['up', 'down']
    direction = util.capitalize util.randomItem(validDirections)
    @setState("#{@direction}To#{direction}")
    @_chooseSequenceLength()

  _chooseSequenceLength: ->
    @sequenceLength = util.randomInt(40, 80)

game.Enemy = Enemy

window.numScriptsLoaded++

{Bounds, Mob, SpriteSheet} = game = window.game

DIRECTIONS = 'left right up down'.split(' ')

class game.Enemy extends Mob
  initialize: ->
    super
    @changeToWandering()
    @direction = $.randomItem(DIRECTIONS)
    @spriteSheet.useSequence(@direction)

  # Override to add animations
  initSpriteSheet: ->
    @spriteSheet = new SpriteSheet(this, 'enemy1.gif', 20, 28)

    @spriteSheet.addSequence 'down',           4, [0,1],   repeat: true
    @spriteSheet.addSequence 'down-to-right', 16, [0,2],   then: 'right'
    @spriteSheet.addSequence 'down-to-left',  16, [0,3],   then: 'left'
    @spriteSheet.addSequence 'right',          4, [4,5],   repeat: true
    @spriteSheet.addSequence 'right-to-up',    4, [4,6],   then: 'up'
    @spriteSheet.addSequence 'right-to-down',  4, [4,7],   then: 'down'
    @spriteSheet.addSequence 'left',           4, [8,9],   repeat: true
    @spriteSheet.addSequence 'left-to-down',   4, [8,10],  then: 'down'
    @spriteSheet.addSequence 'left-to-up',     4, [8,11],  then: 'up'
    @spriteSheet.addSequence 'up',             4, [12,13], repeat: true
    @spriteSheet.addSequence 'up-to-left',     4, [12,14], then: 'left'
    @spriteSheet.addSequence 'up-to-right',    4, [12,15], then: 'right'

  initTopLeftBoundsOnMap: ->
    self = this
    fn = ->
      x1 = $.randomInt(self.bounds.fenceOnMap.x1, self.bounds.fenceOnMap.x2)
      y1 = $.randomInt(self.bounds.fenceOnMap.y1, self.bounds.fenceOnMap.y2)
      self.bounds.onMap.anchor(x1, y1)
    # poor man's do-while :(
    fn(); fn() while @collisionLayer.isIntersection(@bounds.onMap)

  initFence: ->
    @bounds.fenceOnMap = new Bounds(200, 200, 100, 100)

  changeToWandering: ->
    @state = 'wandering'
    @numSteps = 0
    @stepsToWalk = $.randomInt(10)

  update: ->
    # can we keep the current state?
    if bounds = @_nextValidMove()
      # yes, update position
      @bounds.onMap = bounds
      @_recalculateViewportBounds()
    else
      # no, so change direction
      possibleDirections = Array.subtract(DIRECTIONS, @direction)
      direction = @_chooseValidDirectionFrom(possibleDirections)
      @_transitionTo(direction)

  _chooseValidDirectionFrom: (directions) ->
    validDirections = $.every directions, (dir) -> !!@_nextValidMove(dir)
    $.randomItem(validDirections)

  _nextValidMove: (direction) ->
    [dx, dy] = [0, 0]
    switch @direction
      when 'right'
        axis = 'x'
        dx = +@speed
      when 'left'
        axis = 'x'
        dx = -@speed
      when 'up'
        axis = 'y'
        dy = -@speed
      when 'down'
        axis = 'y'
        dy = +@speed

    nextBoundsOnMap = @bounds.onMap.withTranslation(x: dx, y: dy)
    offset = (
      # hey, it rhymes
      @collisionLayer.offsetToNotCollide(direction, nextBoundsOnMap) or
      @bounds.onMap.offsetToKeepInside(direction, nextBoundsOnMap)
    )
    return nextBoundsOnMap.withTranslation(axis, -offset)

  _transitionTo: (direction) ->
    @spriteSheet.useSequence("#{@direction}-to-#{direction}")

  _outsideBoundsOnMap: (bounds) ->
    bounds.x1 < @bounds.onMap.x1 or bounds.x2 > @bounds.onMap.x2 or \
    bounds.y1 < @bounds.onMap.y1 or bounds.y2 > @bounds.onMap.y2


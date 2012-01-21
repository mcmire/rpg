define (require) ->
  $ = require('vendor/ender')
  Mob = require('app/mob')
  Bounds = require('app/bounds')

  DIRECTIONS = 'right down left up'.split(' ')

  Enemy = Mob.extend 'game.Enemy',
    statics:
      image: 'enemy2x.gif'
      width: 40
      height: 56
      speed: 3  # px/frame

    members:
      init: (main) ->
        @_super(main)
        @setState('moveRight')
        @_directionChangeNeeded = false
        @_chooseSequenceLength()

      # override
      _initFence: ->
        @fence = Bounds.rect(100, 100, 300, 300)

      # override
      _initBoundsOnMap: ->
        @_super()
        self = this
        fn = ->
          x1 = $.randomInt(self.fence.x1, self.fence.x2)
          y1 = $.randomInt(self.fence.y1, self.fence.y2)
          self.bounds.onMap.anchor(x1, y1)
        # poor man's do-while :(
        fn(); fn() while @collisionLayer.collidables.intersectsWith(@bounds.onMap)

      # Internal: Move the position of the entity leftward, keeping the entity from
      # moving beyond the edges of the map and intersecting solid parts of the map
      # and other entities moving about.
      #
      moveLeft: ->
        @direction = 'left'

        nextBoundsOnMap = @bounds.onMap.withTranslation(x: -@speed)

        # Would the player hit the right edge of a collision box or the left edge of
        # the fence?
        if (
          (x = @allCollidables.getOuterRightEdgeBlocking(nextBoundsOnMap)) or
          (x = @fence.getInnerLeftEdgeBlocking(nextBoundsOnMap))
        )
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

        nextBoundsOnMap = @bounds.onMap.withTranslation(x: +@speed)

        # Would the player hit the left edge of a collision box or the right edge
        # of the fence?
        if (
          (x = @allCollidables.getOuterLeftEdgeBlocking(nextBoundsOnMap)) or
          (x = @fence.getInnerRightEdgeBlocking(nextBoundsOnMap))
        )
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

        nextBoundsOnMap = @bounds.onMap.withTranslation(y: -@speed)

        # Would the player hit the bottom edge of a collision box or the top edge of
        # the fence?
        if (
          (y = @allCollidables.getOuterBottomEdgeBlocking(nextBoundsOnMap)) or
          (y = @fence.getInnerTopEdgeBlocking(nextBoundsOnMap))
        )
          # Yes: move it just at the edge so it no longer collides
          @bounds.onMap.translateBySide('y1', y)
          # Also choose another direction since we can't go any further
          @_directionChangeNeeded = true
        else
          # No: Move it normally
          @bounds.onMap.replace(nextBoundsOnMap)

      # Internal: Move the position of the entity downward, keeping the entity from
      # moving beyond the edges of the map and intersecting solid parts of the map
      # and other entities moving about.
      #
      moveDown: ->
        @direction = 'down'

        nextBoundsOnMap = @bounds.onMap.withTranslation(y: +@speed)

        # Would the player hit the top edge of a collision box or the bottom edge of
        # the fence?
        if (
          (y = @allCollidables.getOuterTopEdgeBlocking(nextBoundsOnMap)) or
          (y = @fence.getInnerBottomEdgeBlocking(nextBoundsOnMap))
        )
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
      postdraw: ->
        if @_directionChangeNeeded or @numSeqFrameDraws is @sequenceLength
          @_directionChangeNeeded = false
          @_chooseAnotherDirection()
        else
          @_super()

      _chooseAnotherDirection: ->
        validDirections = switch @direction
          when 'up', 'down'    then ['left', 'right']
          when 'left', 'right' then ['up', 'down']
        direction = $.capitalize $.randomItem(validDirections)
        @setState("#{@direction}To#{direction}")
        @_chooseSequenceLength()

      _chooseSequenceLength: ->
        @sequenceLength = $.randomInt(40, 80)

  Enemy.addState 'moveDown',    frames: [0,1],   duration: 4,  repeat: true, move: true
  Enemy.addState 'downToRight', frames: [0,2],   duration: 24, then: 'moveRight'
  Enemy.addState 'downToLeft',  frames: [0,3],   duration: 24, then: 'moveLeft'
  Enemy.addState 'moveRight',   frames: [4,5],   duration: 4,  repeat: true, move: true
  Enemy.addState 'rightToUp',   frames: [4,6],   duration: 24, then: 'moveUp'
  Enemy.addState 'rightToDown', frames: [4,7],   duration: 24, then: 'moveDown'
  Enemy.addState 'moveLeft',    frames: [8,9],   duration: 4,  repeat: true, move: true
  Enemy.addState 'leftToDown',  frames: [8,10],  duration: 24, then: 'moveDown'
  Enemy.addState 'leftToUp',    frames: [8,11],  duration: 24, then: 'moveUp'
  Enemy.addState 'moveUp',      frames: [12,13], duration: 4,  repeat: true, move: true
  Enemy.addState 'upToLeft',    frames: [12,14], duration: 24, then: 'moveLeft'
  Enemy.addState 'upToRight',   frames: [12,15], duration: 24, then: 'moveRight'

  return Enemy

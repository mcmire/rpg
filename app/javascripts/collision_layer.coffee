define (require) ->
  {Class, module} = require('app/meta')
  Grob = require('app/grob')
  Bounds = require('app/bounds')
  {loadable, tickable} = require('app/roles')

  CollidableCollection = Class.extend 'game.CollidableCollection',
    init: ->
      @collidables = []

    getMapBlocks: ->
      c for c in @collidables when c instanceof MapBlock

    each: (fn) ->
      if @exception
        for c in @collidables
          if collidable isnt @exception
            ret = fn(collidable)
            break if ret is false
      else
        for collidable in @collidables
          ret = fn(collidable)
          break if ret is false

    get: (index) ->
      @collidables[index]

    push: (collidable) ->
      @collidables.push(collidable)

    without: (collidable) ->
      new @constructor(@collidables, collidable)

    # Public: Return whether the given bounds intersects with a collidable object.
    #
    # The collision should be detected correctly whether the given bounds are
    # taller or shorter than the collidable in question.
    #
    # bounds - An instance of Bounds.
    #
    # Returns true or false.
    #
    # TODO: Accept either a Bounds or a Box
    #
    intersectsWith: (bounds) ->
      ret = false
      @each (collidable) ->
        if collidable.box.intersectsWith(bounds)
          ret = true
          return false
      return ret

    # Public: Calculate a value that should be subtracted from the x1 coordinate
    # of a bounds box to prevent it from colliding with a collidable object when
    # moving rightward.
    #
    # bounds - An instance of Bounds.
    #
    # Returns the integer X-coordinate of the left side of the collidable that
    # the given bounds collides with if one exists, or null otherwise.
    #
    # TODO: Accept either a Bounds or a Box
    #
    getOuterLeftEdgeBlocking: (bounds) ->
      ret = null
      @each (collidable) ->
        if ret = collidable.box.getOuterLeftEdgeBlocking(bounds)
          return false
      return ret

    # Public: Calculate a value that should be subtracted from the x2 coordinate
    # of a bounds box to prevent it from colliding with a collidable object when
    # moving leftward.
    #
    # bounds - An instance of Bounds.
    #
    # Returns the integer X-coordinate of the right side of the collidable that
    # the given bounds collides with if one exists, or null otherwise.
    #
    # TODO: Accept either a Bounds or a Box
    #
    getOuterRightEdgeBlocking: (bounds) ->
      ret = null
      @each (collidable) ->
        if ret = collidable.box.getOuterRightEdgeBlocking(bounds)
          return false
      return ret

    # Public: Calculate a value that should be subtracted from the y2 coordinate
    # of a bounds box to prevent it from colliding with a collidable object when
    # moving downward.
    #
    # bounds - An instance of Bounds.
    #
    # Returns the integer Y-coordinate of the top side of the collidable that
    # the given bounds collides with if one exists, or null otherwise.
    #
    # TODO: Accept either a Bounds or a Box
    #
    getOuterTopEdgeBlocking: (bounds) ->
      ret = null
      @each (collidable) ->
        if ret = collidable.box.getOuterTopEdgeBlocking(bounds)
          return false
      return ret

    # Public: Calculate a value that should be subtracted from the y1 coordinate
    # of a bounds box to prevent it from colliding with a collidable object when
    # moving upward.
    #
    # bounds - An instance of Bounds.
    #
    # Returns the integer Y-coordinate of the bottom side of the collidable that
    # the given bounds collides with if one exists, or null otherwise.
    #
    # TODO: Accept either a Bounds or a Box
    #
    getOuterBottomEdgeBlocking: (bounds) ->
      ret = null
      @each (collidable) ->
        if ret = collidable.box.getOuterBottomEdgeBlocking(bounds)
          return false
      return ret

  #---

  # This is a Grob so that if we want to we can draw the collision layer
  MapBlock = Grob.extend 'game.MapBlock',
    init: (main, x1, y1, width, height) ->
      @_initDims = ->
        @width = width
        @height = height
      @initBoundsOnMap = ->
        @bounds.onMap = Bounds.rect(x1, y1, width, height)
      @_super(main)

    tick: ->
      # don't draw anything

  #---

  # XXX: Do we still need this anymore?
  CollidableBox = Class.extend 'game.CollidableBox',
    init: (@bounds) ->

    intersectsWith: (bounds) ->
      @bounds.intersectsWith(bounds)

    getOuterLeftEdgeBlocking: (bounds) ->
      @bounds.getOuterLeftEdgeBlocking(bounds)

    getOuterRightEdgeBlocking: (bounds) ->
      @bounds.getOuterRightEdgeBlocking(bounds)

    getOuterTopEdgeBlocking: (bounds) ->
      @bounds.getOuterTopEdgeBlocking(bounds)

    getOuterBottomEdgeBlocking: (bounds) ->
      @bounds.getOuterBottomEdgeBlocking(bounds)

  #---

  collisionLayer = module 'game.collisionLayer', loadable, tickable,
    init: (@main) ->
      @viewport = @main.viewport
      @width = @viewport.width
      @height = @viewport.height

      @collidables = new CollidableCollection()

      # Add map blocks manually until we work out scanning the map image
      @add new MapBlock(@main, 96, 96, 352, 112)
      # Add the other grobs
      @add(collidable) for collidable in @collidables

    add: (collidable) ->
      @collidables.push(collidable)

    load: ->
      @isLoaded = true

    tick: ->
      for collidable in @collidables.getMapBlocks()
        collidable.tick()

  #---

  require \
    CollidableCollection: CollidableCollection
    MapBlock: MapBlock
    CollidableBox: CollidableBox
    collisionLayer: collisionLayer

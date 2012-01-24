define (require) ->
  {module} = require('app/meta')
  {loadable, tickable} = require('app/roles')
  CollidableCollection = require('app/collidable_collection')
  MapBlock = require('app/map_block')

  collisionLayer = module 'game.collisionLayer',
    loadable,
    tickable,

    init: (@core) ->
      @viewport = @core.viewport
      @width = @viewport.width
      @height = @viewport.height

      @collidables = new CollidableCollection()

      # Add map blocks manually until we work out scanning the map image
      @add new MapBlock(@core, 96, 96, 256, 16)
      # Add the other grobs
      # @add(collidable) for collidable in @collidables

    add: (collidable) ->
      @collidables.push(collidable)

    load: ->
      @isLoaded = true

    tick: ->
      for collidable in @collidables.getMapBlocks()
        collidable.tick()

  return collisionLayer

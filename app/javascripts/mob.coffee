define (require) ->
  meta = require('app/meta2')
  Sprite = require('app/sprite')
  Collidable = require('app/collidable')
  Bounds = require('app/bounds')

  # A Mob is a movable object. It lives on the map, in the foreground layer, and
  # has a sprite associated with it that changes state depending on the state of
  # the mob.
  #
  Mob = meta.def 'game.Mob',
    Sprite,
    Collidable,  # implies Mappable

    init: (image, width, height, speed) ->
      @_super(image, width, height)
      @speed = speed

    _initBoundsOnMap: ->
      @_initFence()
      @_super()

    _initFence: ->
      @fence = Bounds.rect(0, 0, @map.width, @map.height)

    predraw: ->
      @_super()

      @[@state.moveHandler]?()

      # the position on the map may have changed, as well as the viewport
      # frame bounds, so we need to do this
      @_recalculateViewportBounds()

  return Mob

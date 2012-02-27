
define 'game.Block', ->
  meta = require('meta')
  {assignable} = require('roles')
  Mappable = require('game.Mappable')
  Collidable = require('game.Collidable')

  # A Block is an object that lives on a map in the foreground layer and is
  # aware when other objects collide with it.
  #
  Block = meta.def \
    assignable,
    Mappable,
    Collidable,

    # tick: (ctx) ->
    #   b = @mbounds
    #   ctx.strokeStyle = '#ff0000'
    #   ctx.strokeRect(b.x1+0.5, b.y1+0.5, @width-0.5, @height-0.5)

    _initCollidableBounds: ->
      @cbounds = require('game.Bounds').rect(0, 0, @width, @height)

  return Block

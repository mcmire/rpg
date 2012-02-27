common = (window.common ||= {})
game = (window.game ||= {})

meta = common.meta
{assignable} = common.roles
Mappable = game.Mappable
Collidable = game.Collidable

# A Block is an object that lives on a map in the foreground layer and is aware
# when other objects collide with it.
#
Block = meta.def 'game.Block',
  assignable,
  Mappable,
  Collidable,

  # tick: (ctx) ->
  #   b = @mbounds
  #   ctx.strokeStyle = '#ff0000'
  #   ctx.strokeRect(b.x1+0.5, b.y1+0.5, @width-0.5, @height-0.5)

  _initCollidableBounds: ->
    @cbounds = game.Bounds.rect(0, 0, @width, @height)

game.Block = Block

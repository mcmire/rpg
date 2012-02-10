game = (window.game ||= {})

meta = game.meta2
{assignable} = game.roles
Mappable = game.Mappable
Collidable = game.Collidable

# A Block is an object that lives on a map in the foreground layer and is aware
# when other objects collide with it.
#
Block = meta.def 'game.Block',
  assignable,
  Mappable,
  Collidable

game.Block = Block

window.scriptLoaded('app/block')

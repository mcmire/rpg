game = (window.game ||= {})

meta = game.meta2
{drawable} = game.roles
Grob = game.Grob
# Collidable = game.Collidable

# A Mob is a Movable OBject. It does what a Grob can do -- that is, it lives
# on the map in the foreground layer, is collidable, and has a sprite. The key
# difference is (judging from the name) that mobs can move whereas grobs
# can't. This makes drawing slightly more tricky because we have to make sure
# to clear the mob's last location on the map before we draw it -- otherwise,
# when the mob moves it will just paint itself all over the viewport. Also,
# since mobs can move, they have a concept of a "fence" -- a box on the map
# that contains them.
#
Mob = Grob.cloneAs('game.Mob').extend
  # drawable,    # implies tickable
  # Collidable,  # implies Mappable

  init: (imagePath, width, height, speed) ->
    @_super(imagePath, width, height)
    @speed = speed

  predraw: ->
    @_super()

    # in calling the handler for the state, the position on the map may have
    # changed, or the viewport may have shifted so the viewport bounds may have
    # changed too
    @recalculateViewportBounds()

  draw: ->
    @currentState.sequence.clear(@ctx)
    @_super()

  _initBoundsOnMap: ->
    @_initFence()
    @_super()

  _initFence: ->
    @fence = game.Bounds.rect(0, 0, @map.width, @map.height)

game.Mob = Mob

window.scriptLoaded('app/mob')


game = (window.game ||= {})

meta = game.meta2
{assignable, simpleDrawable} = game.roles

MapTile = meta.def 'game.MapTile',
  assignable,
  simpleDrawable,

  # Initialize the MapTile.
  #
  # drawable - Either an Image or an ImageSequence.
  #
  init: (@drawable, @x, @y) ->

  draw: ->
    @drawable.draw(@ctx, @x, @y)

game.MapTile = MapTile

window.scriptLoaded('app/map_tile')


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
  init: (@drawable) ->

  setMapPosition: (@x, @y) ->

  assignToMap: (map) ->
    @_super(map)
    @map = map
    @drawable.assignTo(this)
    return this

  draw: (ctx) ->
    @drawable.draw(ctx, @x, @y)

game.MapTile = MapTile

window.scriptLoaded('app/map_tile')


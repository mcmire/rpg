common = (window.common ||= {})
meta = common.meta
{assignable, simpleDrawable} = common.roles

game = (window.game ||= {})

MapTile = meta.def 'game.MapTile',
  assignable,
  simpleDrawable,

  # Initialize the MapTile.
  #
  # drawable - Either an Image or an ImageSequence.
  #
  init: (@drawable) ->
    @mbounds = game.Bounds.rect(0, 0, @drawable.width, @drawable.height)

  setMapPosition: (x, y) ->
    @mbounds.anchor(x, y)

  assignToMap: (map) ->
    @_super(map)
    @map = map
    @drawable.assignTo(this)
    return this

  draw: (ctx) ->
    @drawable.draw(ctx, @mbounds.x1, @mbounds.y1)

game.MapTile = MapTile

game = (window.game ||= {})

meta = game.meta2
{assignable, tickable} = game.roles

Background = meta.def 'game.Background',
  assignable,
  tickable,

  init: (@map, @width, @height) ->
    @fills = []
    @tiles = []
    @sprites = []

  fill: (color, pos, dims) ->
    @fills.push([color, pos, dims])

  addTile: (object, positions...) ->
    self = this
    opts = {}
    if $.v.is.obj(positions[positions.length-1])
      opts = positions.pop()
    $.v.each positions, ([x, y]) ->
      tile = game.MapTile.create object.clone().extend(opts), x, y
      self.tiles.push(tile)
      self.sprites.push(tile) if object.isPrototypeOf(game.ImageSequence)

  load: ->
    # build the map
    @canvas = game.canvas.create(@width, @height)
    @ctx = @canvas.ctx
    tile.assignTo(this) for tile in @tiles
    for [color, [x1, y1], [width, height]] in @fills
      @ctx.fillStyle = color
      @ctx.fillRect(x1, y1, width, height)
    for tile in @tiles
      tile.assignTo(this)
      tile.draw()

  unload: ->
    # Free memory. (This may be a pre-optimization, but it kind of seems like
    # a good idea considering the canvas object will very likely be of a
    # substantial size.)
    @canvas = null
    @ctx = null

  tick: ->
    # Remember that sprites are animated, so here is where we do that
    sprite.draw() for sprite in @sprites

  getDataURL: ->
    'url(' + @canvas.element.toDataURL() + ')'

Background.add = Background.addTile

game.Background = Background

window.scriptLoaded('app/background')

game = (window.game ||= {})

meta = game.meta2
{attachable, assignable, tickable} = game.roles

Background = meta.def 'game.Background',
  assignable,
  tickable,

  init: (@map, @width, @height) ->
    @fills = []
    @tiles = []
    @sprites = []

  assignToViewport: (@viewport) ->

  fill: (color, pos, dims) ->
    @fills.push([color, pos, dims])

  addTile: (object, positions...) ->
    self = this
    opts = {}
    if $.v.is.obj(positions[positions.length-1])
      opts = positions.pop()
    $.v.each positions, ([x, y]) ->
      drawable = object.clone().extend(opts)
      tile = game.MapTile.create(drawable).assignToMap(this)
      tile.setMapPosition(x, y)
      self.tiles.push(tile)
      self.sprites.push(tile) if game.ImageSequence.isPrototypeOf(object)

  load: ->
    @$canvas = $('<canvas>')
      .attr('width', @width)
      .attr('height', @height)
      .addClass('background')
    ctx = @$canvas[0].getContext('2d')
    # build the map
    # ctx.save()
    for [color, [x1, y1], [width, height]] in @fills
      ctx.fillStyle = color
      ctx.fillRect(x1, y1, width, height)
    # ctx.restore()

    tile.draw(ctx) for tile in @tiles

  unload: ->
    # Free memory. (This may be a pre-optimization, but it kind of seems like
    # a good idea considering the canvas object will very likely be of a
    # substantial size.)
    @$canvas = null
    @ctx = null

  attachTo: (@viewport) ->
    # don't use appendTo here, that will clear the canvas for some reason
    @viewport.$element.append(@$canvas)
    @ctx = @$canvas[0].getContext('2d')

  detach: ->
    @$canvas.detach()

  tick: ->
    @$canvas.css
      top: -@viewport.bounds.y1
      left: -@viewport.bounds.x1
    # Remember that sprites are animated, so here is where we do that
    sprite.draw(@ctx) for sprite in @sprites

Background.add = Background.addTile

game.Background = Background

window.scriptLoaded('app/background')

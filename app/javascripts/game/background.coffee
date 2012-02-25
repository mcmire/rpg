
(game = @game).define 'Background', (name) ->
  Background = @meta.def name,
    @roles.assignable,
    @roles.tickable,

    init: (@map, @width, @height) ->
      @fills = []
      @tiles = []
      @sprites = game.SortedObjectMatrix.create()
      @framedSprites = @sprites.clone().extend(game.FramedObjectMatrix)

    assignToViewport: (@viewport) ->
      @framedSprites.frameWithin(@viewport.bounds)

    fill: (color, pos, dims) ->
      @fills.push([color, pos, dims])

    addTile: (proto, positions...) ->
      self = this
      opts = {}
      if $.v.is.obj(positions[positions.length-1])
        opts = positions.pop()
      $.v.each positions, ([x, y]) ->
        object = proto.clone().extend(opts)
        tile = game.MapTile.create(object).assignToMap(this)
        tile.setMapPosition(x, y)
        self.tiles.push(tile)
        self.sprites.push(tile) if game.ImageSequence.isPrototypeOf(proto)

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
      @viewport.getElement().append(@$canvas)
      @ctx = @$canvas[0].getContext('2d')

    detach: ->
      @$canvas.detach()

    tick: ->
      self = this
      @$canvas.css
        top: -@viewport.bounds.y1
        left: -@viewport.bounds.x1
      # Remember that sprites are animated, so here is where we do that
      @framedSprites.each (sprite) -> sprite.draw(self.ctx)

  Background.add = Background.addTile

  return Background

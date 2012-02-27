
define 'game.Background', ->
  meta = require('meta')
  {attachable, assignable, tickable} = require('roles')

  Background = meta.def \
    attachable,
    assignable,
    tickable,

    init: (@map, @width, @height) ->
      @fills = []
      @tiles = []
      @sprites = require('game.SortedObjectMatrix').create()
      @framedSprites = @sprites.clone().extend(require('game.FramedObjectMatrix'))

    setParent: (parent) ->
      @_super(parent)
      @viewport = parent
      @framedSprites.frameWithin(@viewport.bounds)

    attach: ->
      @_super()
      @ctx = @$canvas[0].getContext('2d')

    tick: ->
      self = this
      @$canvas.css
        top: -@viewport.bounds.y1
        left: -@viewport.bounds.x1
      # Remember that sprites are animated, so here is where we do that
      @framedSprites.each (sprite) -> sprite.draw(self.ctx)

    fill: (color, pos, dims) ->
      @fills.push([color, pos, dims])

    addTile: (proto, positions...) ->
      self = this
      opts = {}
      if $.v.is.obj(positions[positions.length-1])
        opts = positions.pop()
      MapTile = require('game.MapTile')
      ImageSequence = require('game.ImageSequence')
      $.v.each positions, ([x, y]) ->
        object = proto.clone().extend(opts)
        tile = MapTile.create(object).assignToMap(this)
        tile.setMapPosition(x, y)
        self.tiles.push(tile)
        self.sprites.push(tile) if ImageSequence.isPrototypeOf(proto)

    load: ->
      @$canvas = $('<canvas>')
        .attr('width', @width)
        .attr('height', @height)
        .addClass('background')
      @setElement(@$canvas)
      ctx = @$canvas[0].getContext('2d')
      # build the map
      # ctx.save()
      for [color, [x1, y1], [width, height]] in @fills
        ctx.fillStyle = color
        ctx.fillRect(x1, y1, width, height)
      # ctx.restore()

      tile.draw(ctx) for tile in @tiles

    # This could be a #destroy method, except that it implies that you'd call init
    # to remove the map completely -- as in, remove it from the map collection --
    # which I don't see a need for
    unload: ->
      # Free memory. (This may be a pre-optimization, but it kind of seems like
      # a good idea considering the canvas object will very likely be of a
      # substantial size.)
      @$canvas = null
      @clearElement()
      @ctx = null

  Background.add = Background.addTile

  return Background

define (require) ->
  meta = require('app/meta2')
  {assignable, tickable, simpleDrawable} = require('app/roles')

  #---

  maps = {}

  require('app/maps/lw_52')(maps)

  #---

  Map = meta.def 'game.Map',
    tickable,

    init: (@name, @width, @height) ->
      @up = @down = @left = @right = null

    withBackground: (fn) ->
      @bg = Background.create(this, width, height)
      fn(@bg)
      return this

    withForeground: (fn) ->
      @fg = Foreground.create(this, width, height)
      fn(@fg)
      return this

    load: (@core, @player) ->
      @bg.load()
      @fg.add(@player)
      @fg.load()

    unload: ->
      @bg.unload()
      @fg.remove(@player)
      @fg.unload()

    tick: ->
      @bg.tick()
      @fg.tick()

    connectsUpTo: (other) ->
      @up = other

    connectsDownTo: (other) ->
      @down = other

    connectsLeftTo: (other) ->
      @left = other

    connectsRightTo: (other) ->
      @right = other

  #---

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
        tile = MapTile.create object.cloneWith(opts), x, y
        tile.assignTo(self)
        self.tiles.push(tile)
        self.sprites.push(tile) if object.isPrototypeOf(ImageSequence)

    load: ->
      # build the map
      @canvas = canvas.create(@width, @height)
      ctx = @canvas.ctx
      for [color, [x1, y1], [width, height]] in @fills
        ctx.fillStyle = color
        ctx.fillRect(x1, y1, width, height)
      tile.draw() for tile in @tiles

    unload: ->
      # Free memory. (This may be a pre-optimization, but it kind of seems like
      # a good idea considering the canvas object will very likely be of a
      # substantial size.)
      @canvas = null

    tick: ->
      # Remember that sprites are animated, so here is where we do that
      sprite.draw() for sprite in @sprites

    getDataUrl: ->
      @canvas.element.toDataUrl()

  Background.add = Background.addTile

  #---

  # TODO: What about the collision layer?????
  Foreground = meta.def 'game.Foreground',
    assignable,
    tickable,

    init: (@map, @width, @height) ->
      @objects = []
      @player = null
      @playerIndex = -1

    addObject: (object, positions...) ->
      for [x, y] in positions
        clone = object.clone()
        clone.setMapPosition(x, y)
        @objects.push(object)

    addPlayer: (@player) ->
      @objects.push(player)
      @playerIndex = @objects.length-1

    removePlayer: ->
      @objects.splice(@playerIndex, 1)

    load: ->
      # Place objects on the map
      # TODO: Place the player somewhere on the map
      @canvas = canvas.create(@width, @height)

    unload: ->
      @canvas = null

    tick: ->
      object.tick() for object in @objects

    getDataUrl: ->
      @canvas.element.toDataUrl()

  Foreground.add = Foreground.addObject

  #---

  return {
    maps: maps
    Map: Map
    Background: Background
    Foreground: Foreground
  }

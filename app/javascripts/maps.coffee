game = (window.game ||= {})

meta = game.meta2
{assignable, tickable, simpleDrawable} = game.roles
canvas = game.canvas
MapTile = game.MapTile
ImageSequence = game.ImageSequence

#---

maps = {}

#---

Map = meta.def 'game.Map',
  tickable,

  init: (@name, @width, @height) ->
    @up = @down = @left = @right = null

  withBackground: (fn) ->
    @background = Background.create(this, @width, @height)
    fn(@background)
    return this

  withForeground: (fn) ->
    @foreground = Foreground.create(this, @width, @height)
    fn(@foreground)
    return this

  load: (@core, @player) ->
    @background.load()
    @foreground.add(@player)
    @foreground.load()

  unload: ->
    @background.unload()
    @foreground.remove(@player)
    @foreground.unload()

  tick: ->
    @background.tick()
    @foreground.tick()

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
      tile = MapTile.create object.clone().extend(opts), x, y
      tile.assignTo(self)
      self.tiles.push(tile)
      self.sprites.push(tile) if object.isPrototypeOf(ImageSequence)

  load: ->
    # build the map
    @canvas = canvas.create(@width, @height)
    @ctx = @canvas.ctx
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
    @canvas.element.toDataURL()

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

  getDataURL: ->
    @canvas.element.toDataUrl()

Foreground.add = Foreground.addObject

#---

game.maps =
  maps: maps
  Map: Map
  Background: Background
  Foreground: Foreground

window.scriptLoaded('app/maps')

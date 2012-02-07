game = (window.game ||= {})

meta = game.meta2
{assignable, tickable, simpleDrawable} = game.roles

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
    @foreground.addPlayer(@player, [100, 100])
    @foreground.load()

  unload: ->
    @background.unload()
    @foreground.removePlayer(@player)
    @foreground.unload()

  frameInViewport: (viewport) ->
    @foreground.calculateAllViewportBounds(viewport)

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

#---

# TODO: What about the collision layer?????
Foreground = meta.def 'game.Foreground',
  assignable,
  tickable,

  init: (@map, @width, @height) ->
    @objectDefs = []
    @objects = []
    @player = null

  addObject: (object, positions...) ->
    @objectDefs.push([object, positions])

  addPlayer: (player, position) ->
    @addObject(player, position)

  removePlayer: ->
    index = @objects.indexOf(@player)
    @objects.splice(index, 1)

  load: ->
    # Place objects on the map
    # TODO: Place the player somewhere on the map
    @canvas = game.canvas.create(@width, @height)
    @ctx = @canvas.ctx
    for [object, positions] in @objectDefs
      for [x, y] in positions
        clone = object.clone().assignTo(this).init()
        clone.setMapPosition(x, y)
        @objects.push(clone)
      if clone.__name__ is 'game.player'
        @player = clone

  unload: ->
    # Free memory. (This may be a pre-optimization, but it kind of seems like
    # a good idea considering the canvas object will very likely be of a
    # substantial size.)
    @canvas = null
    @ctx = null
    @objects = []
    @player = null

  calculateAllViewportBounds: (viewport) ->
    # Save viewport so that each object has access to it
    @viewport = viewport
    object.recalculateViewportBounds() for object in @objects

  tick: ->
    object.tick() for object in @objects

  getDataURL: ->
    @canvas.element.toDataUrl()

  getViewport: ->
    @viewport

Foreground.add = Foreground.addObject
Foreground.remove = Foreground.removeObject

#---

game.mapCollection =
  get: (name) -> maps[name]
  set: (name, map) -> maps[name] = map
  Map: Map
  Background: Background
  Foreground: Foreground

window.scriptLoaded('app/maps')

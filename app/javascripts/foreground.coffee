game = (window.game ||= {})

meta = game.meta2
{assignable, tickable} = game.roles

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

game.Foreground = Foreground

window.scriptLoaded('app/foreground')

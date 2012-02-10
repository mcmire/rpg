game = (window.game ||= {})

meta = game.meta2
{attachable, assignable, tickable} = game.roles

Foreground = meta.def 'game.Foreground',
  assignable,
  tickable,

  init: (@map, @width, @height) ->
    @objects = game.CollidableCollection.create()
    @grobs = []
    @player = null
    @enableCollisions = true

  assignToViewport: (@viewport) ->

  addObject: (proto, positions...) ->
    self = this
    $.v.each positions, ([x, y]) ->
      object = proto.clone().assignToMap(self).init()
      object.setMapPosition(array[0], array[1])
      self.objects.push(object)
      self.grobs.push(object) if game.Grob.isPrototypeOf(object)

  removeObject: (object) ->
    @objects.delete(object)
    @grobs.delete(object)

  addPlayer: (@player) ->
    @player.assignToMap(this)
    # TODO: Place the player somewhere on the map
    #       Probably leave it up to the specific map to decide this
    @objects.push(@player)
    @grobs.push(@player)

  removePlayer: ->
    @removeObject(@player)

  load: ->
    @$canvas = $('<canvas>')
      .attr('width', @width)
      .attr('height', @height)
      .addClass('foreground')

  unload: ->
    # Free memory. (This may be a pre-optimization, but it kind of seems like a
    # good idea considering the canvas object will very likely be of a
    # substantial size.)
    @$canvas = null
    @ctx = null

  # resume the map
  activate: ->
    @objects.each (object) -> object.activate()

  # pause the map, freeze input
  # this isn't really used currently, but it's a nice idea
  deactivate: ->
    @objects.each (object) -> object.deactivate()

  attachTo: (@viewport) ->
    # Save viewport so that each object has access to it through the magic
    # of the Mappable interface
    @$canvas.appendTo(@viewport.$element)
    @ctx = @$canvas[0].getContext('2d')

  detach: ->
    @$canvas.detach()

  tick: ->
    @$canvas.css
      top: -@viewport.bounds.y1
      left: -@viewport.bounds.x1
    grob.tick(@ctx) for grob in @grobs

  getObjectsWithout: (object) ->
    @objects.without(object)

Foreground.add = Foreground.addObject
Foreground.remove = Foreground.removeObject

game.Foreground = Foreground

window.scriptLoaded('app/foreground')

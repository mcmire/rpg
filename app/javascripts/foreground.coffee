game = (window.game ||= {})

meta = game.meta2
{attachable, assignable, tickable} = game.roles

Foreground = meta.def 'game.Foreground',
  assignable,
  tickable,

  init: (@map, @width, @height) ->
    @objects = game.CollidableCollection.create()
    @grobs = []
    @blocks = []
    @player = null
    @enableCollisions = true

  assignToViewport: (@viewport) ->

  addObject: (proto, positions...) ->
    self = this
    $.v.each positions, ([x, y, width, height]) ->
      object = proto.clone().assignToMap(self).init(width, height)
      object.setMapPosition(x, y)
      self.objects.push(object)
      if game.Grob.isPrototypeOf(object)
        self.grobs.push(object)
      else if object.tick?
        self.blocks.push(object)

  removeObject: (object) ->
    @objects.delete(object)
    @grobs.delete(object)

  addPlayer: (@player) ->
    @player.assignToMap(this)
    @objects.push(@player)
    @grobs.push(@player)

  removePlayer: ->
    @removeObject(@player)

  onLoad: (@onLoadCallback) ->

  load: ->
    @$canvas = $('<canvas>')
      .attr('width', @width)
      .attr('height', @height)
      .addClass('foreground')
    @onLoadCallback?.call(this)

  unload: ->
    # Free memory. (This may be a pre-optimization, but it kind of seems like a
    # good idea considering the canvas object will very likely be of a
    # substantial size.)
    @$canvas = null
    @ctx = null

  # resume the map
  activate: ->
    grob.activate() for grob in @grobs

  # pause the map, freeze input
  # this isn't really used currently, but it's a nice idea
  deactivate: ->
    grob.deactivate() for grob in @grobs

  attachTo: (@viewport) ->
    # Save viewport so that each object has access to it through the magic
    # of the Mappable interface
    # don't use appendTo here, that messes stuff up for some reason
    @viewport.$element.append(@$canvas)
    @ctx = @$canvas[0].getContext('2d')

  detach: ->
    @$canvas.detach()

  tick: ->
    @$canvas.css
      top: -@viewport.bounds.y1
      left: -@viewport.bounds.x1
    grob.tick(@ctx) for grob in @grobs
    block.tick(@ctx) for block in @blocks

  getObjectsWithout: (object) ->
    @objects.without(object)

Foreground.add = Foreground.addObject
Foreground.remove = Foreground.removeObject

game.Foreground = Foreground

window.scriptLoaded('app/foreground')

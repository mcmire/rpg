game = (window.game ||= {})

meta = game.meta2
{attachable, assignable, tickable} = game.roles

Foreground = meta.def 'game.Foreground',
  assignable,
  tickable,

  init: (@map, @width, @height) ->
    @objects = game.CollidableMatrix.create(this)
    @framedObjects = @objects.clone().extend(game.FramedObjectMatrix)
    @blocks = []
    @player = null
    @enableCollisions = true

  assignToViewport: (@viewport) ->
    @framedObjects.frameWithin(@viewport.bounds)

  addObject: (proto, positions...) ->
    self = this
    $.v.each positions, ([x, y, width, height]) ->
      object = proto.clone().assignToMap(self)#.init(width, height)
      object.setMapPosition(x, y)
      self.objects.push(object)

  removeObject: (object) ->
    @objects.remove(object)

  addPlayer: (@player) ->
    @player.assignToMap(this)
    @objects.add(@player)

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
    @objects.each (object) -> object.activate?()

  # pause the map, freeze input
  # this isn't really used currently, but it's a nice idea
  deactivate: ->
    @objects.each (object) -> object.deactivate?()

  attachTo: (@viewport) ->
    # Save viewport so that each object has access to it through the magic
    # of the Mappable interface
    # don't use appendTo here, that messes stuff up for some reason
    @viewport.$element.append(@$canvas)
    @ctx = @$canvas[0].getContext('2d')

  detach: ->
    @$canvas.detach()

  tick: ->
    self = this
    @$canvas.css
      top: -@viewport.bounds.y1
      left: -@viewport.bounds.x1
    # Clear all of the objects first before drawing all of them so that we can
    # layer sprites on top of each other - if each object clears and draws
    # itself separately then an object that sits behind another will get
    # partially or fully erased before the object in front is drawn
    @framedObjects.each (object) -> object.predraw?(self.ctx)
    @framedObjects.each (object) -> object.draw?(self.ctx)
    @framedObjects.each (object) -> object.postdraw?(self.ctx)

  getObjectsWithout: (object) ->
    @framedObjects.clone().extend(game.FilteredObjectMatrix).without(object)

Foreground.add = Foreground.addObject
Foreground.remove = Foreground.removeObject

game.Foreground = Foreground

window.scriptLoaded('app/foreground')

common = (window.common ||= {})
meta = common.meta
{attachable, assignable, tickable} = common.roles

game = (window.game ||= {})

Foreground = meta.def 'game.Foreground',
  attachable,
  assignable,
  tickable,

  init: (@map, @width, @height) ->
    @objects = game.CollidableMatrix.create(this)
    @framedObjects = @objects.clone().extend(game.FramedObjectMatrix)
    @blocks = []
    @player = null
    @enableCollisions = true

  setParent: (parent) ->
    @_super(parent)
    # Save viewport so that each object has access to it through the magic
    # of the Mappable interface
    @viewport = parent
    @framedObjects.frameWithin(@viewport.bounds)

  attach: ->
    @_super()
    @ctx = @$canvas[0].getContext('2d')

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

  addObject: (proto, positions...) ->
    self = this
    $.v.each positions, ([x, y, width, height]) ->
      object = proto.clone().assignToMap(self)
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
    @setElement(@$canvas)
    @onLoadCallback?.call(this)

  # This could be a #destroy method, except that it implies that you'd call init
  # to remove the map completely -- as in, remove it from the map collection --
  # which I don't see a need for
  unload: ->
    # Free memory. (This may be a pre-optimization, but it kind of seems like a
    # good idea considering the canvas object will very likely be of a
    # substantial size.)
    @$canvas = null
    @clearElement()
    @ctx = null

  # resume the map
  activate: ->
    @objects.each (object) -> object.activate?()

  # pause the map, freeze input
  # this isn't really used currently, but it's a nice idea
  deactivate: ->
    @objects.each (object) -> object.deactivate?()

  getObjectsWithout: (object) ->
    coll =
      if @enableCollisions
        @framedObjects.clone()
      else
        # null/empty object pattern - still works but does nothing
        game.CollidableMatrix.create(this)
    coll.extend(game.FilteredObjectMatrix).without(object)
    return coll

Foreground.add = Foreground.addObject
Foreground.remove = Foreground.removeObject

game.Foreground = Foreground

game = (window.game ||= {})

meta = game.meta2

ROLES = [
  'game.eventable'
  'game.attachable'
  'game.tickable'
  'game.drawable'
  'game.simpleDrawable'
  'game.loadable'
  'game.runnable'
  'game.assignable'
]

_getSafeNameFrom = (obj) ->
  name = obj.constructor.__name__ ? obj.__name__
  (name || "").replace(".", "_")

#---

# Separate this from eventable because we don't want plug methods
# to be created for these methods (e.g. @plugins.eventable.bindHelpers)
eventHelpers =
  bindEvents: (obj, events) ->
    # @__name__ is set when the module is created, see metaobj.coffee
    ns = _getSafeNameFrom(obj)
    namespacedEvents = {}
    namespacedEvents[name + "." + ns] = fn for name, fn of events
    $(obj).bind(namespacedEvents)

  unbindEvents: (obj, args...) ->
    # @__name__ is set when the module is created, see metaobj.coffee
    ns = _getSafeNameFrom(obj)
    namespacedEventNames = (name + "." + ns for name in args)
    $(obj).unbind(namespacedEventNames...)

  triggerEvents: (obj, args...) ->
    # @__name__ is set when the module is created, see metaobj.coffee
    ns = _getSafeNameFrom(obj)
    namespacedEventNames = (name + "." + ns for name in args)
    $(obj).trigger(namespacedEventNames...)

eventable = meta.def 'game.eventable',
  __extended__: (base) ->
    base.extend(eventHelpers)

  addEvents: ->
    throw new Error 'addEvents must be overridden'

  removeEvents: ->
    throw new Error 'removeEvents must be overridden'

  destroy: ->
    @removeEvents()
    @_super()

# TODO: This could probably be cleaned up... setElement() could set anything
# which we don't necessarily want
attachable = meta.def 'game.attachable',
  init: (args...) ->
    @_super(args...)
    @setParentElement(args[0])
    @setElement()
    return this

  setParentElement: (parent) ->
    if parent.doesInclude?('game.attachable')
      @parentElement = parent.$element
    else
      # assume that parent is a selector or Bonzo element
      @parentElement = parent
    return this

  setElement: ->
    # throw new Error 'setElement must be overridden'

  destroy: ->
    @detach()
    @_super()

  attach: ->
    # by default we assume you want to attach to the parent element but it is
    # totally ok to override this to use another object
    @$element?.appendTo(@parentElement)
    return this

  detach: ->
    @$element?.detach()
    return this

tickable = meta.def 'game.tickable',
  tick: ->
    throw new Error 'tick must be overridden'

simpleDrawable = meta.def 'game.simpleDrawable',
  draw: ->
    throw new Error 'draw must be overridden'

drawable = meta.def 'game.drawable',
  tickable,
  simpleDrawable,

  tick: ->
    @predraw()
    @draw()
    @postdraw()
    return this

  predraw: ->
    # throw new Error 'predraw must be overridden'

  postdraw: ->
    # throw new Error 'postdraw must be overridden'

loadable = meta.def 'game.loadable',
  init: (args...) ->
    @_super(args...)
    @isLoaded = false
    return this

  load: ->
    throw new Error 'load must be overridden'

  isLoaded: ->
    throw new Error 'isLoaded must be overridden'

runnable = meta.def 'game.runnable',
  destroy: ->
    @stop()
    @_super()

  start: ->
    throw new Error 'start must be overridden'

  stop: ->
    throw new Error 'stop must be overridden'

  suspend: ->
    throw new Error 'suspend must be overridden'

  resume: ->
    throw new Error 'resume must be overridden'

assignable = meta.def 'game.assignable',
  assignTo: (parent) ->
    @parent = parent
    @ctx = parent.ctx
    return this

#---

game.roles =
  ROLES: ROLES
  eventable: eventable
  attachable: attachable
  tickable: tickable
  drawable: drawable
  simpleDrawable: simpleDrawable
  loadable: loadable
  runnable: runnable
  assignable: assignable

window.scriptLoaded('app/roles')

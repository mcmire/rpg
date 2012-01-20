g = window.game ||= {}

ROLES = [
  'eventable'
  'attachable'
  'tickable'
  'drawable'
  'loadable'
  'runnable'
]

_getSafeNameFrom = (obj) ->
  name = (obj.__name__ || (obj.constructor && obj.constructor.__name__))
  (name || "").replace(".", "_")

eventable = g.module 'game.eventable',
  addEvents: ->
    throw new Error 'must be overridden'

  removeEvents: ->
    throw new Error 'must be overridden'

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

attachable = g.module 'game.attachable',
  attachTo: (container) ->
    @$element.appendTo(container)

  detach: (container) ->
    @$element.detach()

tickable = g.module 'game.tickable',
  tick: ->
    throw new Error 'must be overridden'

drawable = g.module 'game.drawable', tickable,
  predraw: ->
    throw new Error 'must be overridden'

  draw: ->
    throw new Error 'must be overridden'

  postdraw: ->
    throw new Error 'must be overridden'

loadable = g.module 'game.loadable',
  load: ->
    throw new Error 'must be overridden'

  isLoaded: ->
    throw new Error 'must be overridden'

runnable = g.module 'game.runnable',
  start: ->
    throw new Error 'must be overridden'

  stop: ->
    throw new Error 'must be overridden'

  suspend: ->
    throw new Error 'must be overridden'

  resume: ->
    throw new Error 'must be overridden'

g.ROLES = ROLES
g.eventable = eventable
g.attachable = attachable
g.tickable = tickable
g.drawable = drawable
g.loadable = loadable
g.runnable = runnable

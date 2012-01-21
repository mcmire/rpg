define (require) ->
  {module} = require('app/meta')

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

  eventable = module 'game.eventable',
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

  attachable = module 'game.attachable',
    attachTo: (container) ->
      @$element.appendTo(container)

    detach: (container) ->
      @$element.detach()

  tickable = module 'game.tickable',
    tick: ->
      throw new Error 'must be overridden'

  drawable = module 'game.drawable', tickable,
    predraw: ->
      throw new Error 'must be overridden'

    draw: ->
      throw new Error 'must be overridden'

    postdraw: ->
      throw new Error 'must be overridden'

  loadable = module 'game.loadable',
    load: ->
      throw new Error 'must be overridden'

    isLoaded: ->
      throw new Error 'must be overridden'

  runnable = module 'game.runnable',
    start: ->
      throw new Error 'must be overridden'

    stop: ->
      throw new Error 'must be overridden'

    suspend: ->
      throw new Error 'must be overridden'

    resume: ->
      throw new Error 'must be overridden'

  #---

  return \
    ROLES: ROLES
    eventable: eventable
    attachable: attachable
    drawable: drawable
    loadable: loadable
    runnable: runnable

define (require) ->
  {module} = require('app/meta')

  ROLES = [
    'game.eventable'
    'game.attachable'
    'game.tickable'
    'game.drawable'
    'game.loadable'
    'game.runnable'
  ]

  _getSafeNameFrom = (obj) ->
    name = obj.constructor.__name__ ? obj.__name__
    (name || "").replace(".", "_")

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

  eventable = module 'game.eventable',
    __extended__: (base) ->
      base.methods(eventHelpers)

    addEvents: ->
      throw new Error 'addEvents must be overridden'

    removeEvents: ->
      throw new Error 'removeEvents must be overridden'

    destroy: ->
      @removeEvents()
      @_super()

  attachable = module 'game.attachable',
    init: (args...) ->
      @_super(args...)
      @parent = args[0]

    destroy: ->
      @detach() if @$element
      @_super()

    attach: ->
      # by default we assume you want to attach to the parent element but it is
      # totally ok to override this to use another object
      @$element.appendTo(@parent.$element)

    detach: (container) ->
      @$element.detach()

  tickable = module 'game.tickable',
    tick: ->
      throw new Error 'tick must be overridden'

  drawable = module 'game.drawable', tickable,
    predraw: ->
      throw new Error 'predraw must be overridden'

    draw: ->
      throw new Error 'draw must be overridden'

    postdraw: ->
      throw new Error 'postdraw must be overridden'

  loadable = module 'game.loadable',
    init: (args...) ->
      @_super(args...)
      @isLoaded = false

    load: ->
      throw new Error 'load must be overridden'

    isLoaded: ->
      throw new Error 'isLoaded must be overridden'

  runnable = module 'game.runnable',
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

  #---

  return {
    ROLES: ROLES
    eventable: eventable
    attachable: attachable
    tickable: tickable
    drawable: drawable
    loadable: loadable
    runnable: runnable
  }

g = window.game ||= {}

# DEPRECATED - use eventable instead

eventHelpers = g.module 'game.eventHelpers',
  bindEvents: (obj, events) ->
    # @__name__ is set when the module is created, see metaobj.coffee
    namespacedEvents = {}
    namespacedEvents[name + "." + @__name__.replace(".", "_")] = fn for name, fn of events
    $(obj).bind(namespacedEvents)

  unbindEvents: (obj, args...) ->
    # @__name__ is set when the module is created, see metaobj.coffee
    namespacedEventNames = (name + "." + @__name__.replace(".", "_") for name in args)
    $(obj).unbind(namespacedEventNames...)

  triggerEvents: (obj, args...) ->
    # @__name__ is set when the module is created, see metaobj.coffee
    namespacedEventNames = (name + "." + @__name__.replace(".", "_") for name in args)
    $(obj).trigger(namespacedEventNames...)

g.eventHelpers = eventHelpers

game = window.game

game.util.module "game.EventHelpers"
  bindEvents: (obj, events) ->
    namespacedEvents = {}
    namespacedEvents[name + "." + @__name.replace(".", "_")] = fn for name, fn of events
    # obj = $(obj) unless 'bind' of obj
    $(obj).bind(namespacedEvents)

  unbindEvents: (obj, args...) ->
    namespacedEventNames = (name + "." + @__name.replace(".", "_") for name in args)
    # obj = $(obj) unless 'unbind' of obj
    $(obj).unbind(namespacedEventNames...)

  triggerEvents: (obj, args...) ->
    namespacedEventNames = (name + "." + @__name.replace(".", "_") for name in args)
    # obj = $(obj) unless 'trigger' of obj
    $(obj).trigger(namespacedEventNames...)

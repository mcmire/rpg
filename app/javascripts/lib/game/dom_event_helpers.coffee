game = window.game

game.util.module "game.DOMEventHelpers"
  bindEvents: (elem, events) ->
    namespacedEvents = {}
    namespacedEvents[name + "." + @__name] = fn for name, fn of events
    $(elem).bind namespacedEvents

  unbindEvents: (elem, args...) ->
    namespacedEventNames = (name + "." + @__name for name in args)
    $(elem).unbind namespacedEventNames.join(" ")

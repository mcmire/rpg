game = window.game

game.util.module "game.DOMEventHelpers"
  bindEvents: (elem, events) ->
    namespacedEvents = {}
    namespacedEvents[name + "." + @moduleName] = fn for name, fn of events
    $(elem).bind namespacedEvents

  unbindEvents: (elem, args...) ->
    namespacedEventNames = (name + "." + @moduleName for name in args)
    $(elem).unbind namespacedEventNames.join(" ")

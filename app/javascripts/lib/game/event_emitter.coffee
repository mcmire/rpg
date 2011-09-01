game = window.game

ee = game.util.module "game.EventEmitter"

# ee.namespacedEvents = {}
ee.namespacedEvents = {}

ee.bind =
ee.addListener =
ee.on = (args...) ->
  events = {}
  if args.length is 2
    events[args[0]] = args[1]
  else
    events = args[0]

  for str, fn of events
    # "eventName", "eventName.ns"
    [eventName, ns] = str.split(".", 2)
    ns ||= "__global__"
    events = @namespacedEvents[ns] ||= {}
    callbacks = events[eventName] ||= []
    callbacks.push(fn)

ee.unbind =
ee.removeListener = (strs...) ->
  for str in strs
    # "eventName", "eventName.ns", ".ns"
    [eventName, ns] = str.split(".", 2)
    ns ||= "__global__"
    if events = @namespacedEvents[ns]
      if eventName
        delete events[eventName]
      else
        delete @namespacedEvents[ns]

ee.trigger =
ee.fire =
ee.emit = (strs...) ->
  for str in strs
    # "eventName", "eventName.ns", ".ns"
    [eventName, ns] = str.split(".", 2)
    ns ||= "__global__"
    if events = @namespacedEvents[ns]
      if eventName
        fn() for fn in events[eventName]
      else
        for eventName, callbacks of events
          fn() for fn in callbacks

game = (window.game ||= {})

maps = {}

game.mapCollection =
  get: (name) ->
    maps[name]
  add: (name, width, height, fn) ->
    maps[name] = game.Map.create(name, width, height, fn)

window.scriptLoaded('app/map_collection')

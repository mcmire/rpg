(game = @game).define 'mapCollection', (name) ->
  return {
    get: (name) ->
      maps[name]
    add: (name, width, height, fn) ->
      maps[name] = game.Map.create(name, width, height, fn)
  }

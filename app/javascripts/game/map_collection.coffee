
define 'game.mapCollection', ->
  maps = {}

  return {
    get: (name) ->
      maps[name]
    add: (name, width, height, fn) ->
      map = require('game.Map').create(name, width, height, fn)
      maps[name] = map
      return map
  }

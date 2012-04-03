
define 'game.mapCollection', ->
  maps = {}

  get = (name) ->
    imageCollection = require('game.imageCollection')
    spriteCollection = require('game.spriteCollection')
    spr = spriteCollection.get
    img = imageCollection.get
    maps[name] = require("game/maps/#{name}")(add, img, spr)

  add = (name, width, height, fn) ->
    map = require('game.Map').create(name, width, height, fn)
    maps[name] = map
    return map

  #---

  return {
    get: get
    add: add
  }

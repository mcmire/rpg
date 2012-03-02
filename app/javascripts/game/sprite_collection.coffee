
define 'game.spriteCollection', ->
  ImageSequence = require('game.ImageSequence')
  imageCollection = require('game.imageCollection')

  sprites = {}

  add = (name, width, height, frameIndices, opts={}) ->
    sprites[name] = ImageSequence.create(name, imageCollection.get(name), width, height, frameIndices, opts)

  get = (name) ->
    sprites[name] or throw new Error "Couldn't find sprite #{name}!"

  each = (fn) ->
    names = $.v.keys(sprites).sort()
    $.v.each names, (name) -> fn(sprites[name])

  #---

  add 'flower', 16, 16, [2, 0, 1], frameDuration: 6, doesRepeat: true

  #---

  return {
    get: get
    each: each
  }

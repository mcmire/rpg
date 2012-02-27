
define 'game.FramedObjectMatrix', ->
  meta = require('meta')

  return meta.def
    frameWithin: (@bounds) ->
      return this

    each: (fn) ->
      self = this
      @_super (object) ->
        if self.bounds.doesContain(object)
          ret = fn(object)
          return false if ret is false

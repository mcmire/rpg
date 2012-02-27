
define 'game.FilteredObjectMatrix', ->
  meta = require('meta')

  return meta.def
    without: (@exception) ->
      return this

    each: (fn) ->
      self = this
      @_super (object) ->
        if object isnt self.exception
          ret = fn(object)
          return false if ret is false

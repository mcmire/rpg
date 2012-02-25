(game = @game).define 'FilteredObjectMatrix', (name) ->
  FilteredObjectMatrix = @meta.def name,
    without: (@exception) ->
      return this

    each: (fn) ->
      self = this
      @_super (object) ->
        if object isnt self.exception
          ret = fn(object)
          return false if ret is false

  return FilteredObjectMatrix

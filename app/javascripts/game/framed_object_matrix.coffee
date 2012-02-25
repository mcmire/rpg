(game = @game).define 'FramedObjectMatrix', (name) ->
  FramedObjectMatrix = @meta.def name,
    frameWithin: (@bounds) ->
      return this

    each: (fn) ->
      self = this
      @_super (object) ->
        if self.bounds.doesContain(object)
          ret = fn(object)
          return false if ret is false

  return FramedObjectMatrix

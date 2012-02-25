game = (window.game ||= {})

meta = game.meta2

FramedObjectMatrix = meta.def 'game.FramedObjectMatrix',
  frameWithin: (@bounds) ->
    return this

  each: (fn) ->
    self = this
    @_super (object) ->
      if self.bounds.doesContain(object)
        ret = fn(object)
        return false if ret is false

game.FramedObjectMatrix = FramedObjectMatrix

window.scriptLoaded('app/framed_object_matrix')

game = (window.game ||= {})

meta = game.meta2

FramedObjectCollection = meta.def 'game.FramedObjectCollection',
  frameWithin: (@bounds) ->
    return this

  each: (fn) ->
    self = this
    @_super (object) ->
      if self.bounds.doesContain(object)
        ret = fn(object)
        return false if ret is false

game.FramedObjectCollection = FramedObjectCollection

window.scriptLoaded('app/framed_object_collection')

game = (window.game ||= {})

meta = game.meta2

FilteredObjectCollection = meta.def 'game.FilteredObjectCollection',
  without: (@exception) ->
    return this

  each: (fn) ->
    self = this
    @_super (object) ->
      if object isnt self.exception
        ret = fn(object)
        return false if ret is false

game.FilteredObjectCollection = FilteredObjectCollection

window.scriptLoaded('app/filtered_object_collection')


define 'game.SortedObjectMatrix', ->
  meta = require('meta')

  SortedObjectMatrix = meta.def
    # Initialize the collection.
    #
    # map - An instance of Foreground or Background.
    #
    init: (@map) ->
      @rows = require('game.OrderedMap').create()

    # Public: Add an object to the collection, keeping @objects in sorted order.
    #
    add: (object) ->
      [y, x] = [object.mbounds.y1, object.mbounds.x1]
      unless row = @rows.get(y)
        row = require('game.OrderedMap').create()
        @rows.set(y, row)
      row.set(x, object)

    # Public: Remove an object from the collection, patching holes.
    #
    remove: (object) ->
      [y, x] = [object.mbounds.y1, object.mbounds.x1]
      if row = @rows.get(y)
        row.delete(x)
        if row.isEmpty()
          @rows.delete(y)

    each: (fn) ->
      @rows.each (row) ->
        ret = row.each (object) ->
          ret2 = fn(object)
          return false if ret2 is false
        return false if ret is false

    getObjects: ->
      objects = []
      @each (object) -> objects.push(object)
      return objects

  SortedObjectMatrix.aliases
    add: 'push'
    remove: 'delete'

  return SortedObjectMatrix


define 'editor.dnd', ->
  return {
    startDraggingWith: (@dragObject) ->
    stopDragging: -> @dragObject = null
  }

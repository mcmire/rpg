
define 'editor', ->
  init: ->
    require('editor.dnd')  # go ahead and load this
    require('editor.core').init()


define 'editor.viewport', ->
  meta = require('meta')

  meta.def
    init: (@core) ->
      @$map = $('#editor-map')
      @width = @$map.width()
      @height = @$map.height()
      @bounds = require('game.Bounds').rect(0, 0, @width, @height)
      return this

    setHeight: (height) ->
      @$map.height(height)
      @height = height

    setMap: (map) ->
      @currentMap = map
      map.setParent(this)
      map.attach()

    unsetMap: ->
      @currentMap.detach()

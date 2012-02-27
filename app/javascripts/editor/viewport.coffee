
editor = (game.editor ||= {})

meta = common.meta2

viewport = meta.def 'editor.viewport',
  init: (@core) ->
    @$map = $('#editor-map')
    @width = @$map.width()
    @height = @$map.height()
    @bounds = game.Bounds.rect(0, 0, @width, @height)
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


common = window.common
game = window.game
editor = (window.editor ||= {})

meta = common.meta2

core = meta.def 'editor.core',
  init: ->
    @viewport = editor.viewport.init(this)
    @$sidebar = $('#editor-sidebar select')
    @$mapChooser = $('#editor-map-chooser select')
    @$layerChooser = $('#editor-layer-chooser').attr('disabled', 'disabled')

    @_resizeUI()
    $(window).resize => @_resizeUI()

    @_loadImages()
    @_whenImagesLoaded =>
      @_populateSidebar()
      @$mapChooser.change => @_chooseMap(this.value)
      @$layerChooser.change => @_chooseLayer(this.value)

  _resizeUI: ->
    wh = $(window).height()
    nh = $('#editor-nav').height()
    h = wh - nh
    @viewport.setHeight(h)
    @$sidebar.height(wh - nh)

  _loadImages: ->
    game.imageCollection.load()

  _whenImagesLoaded: (fn) ->
    t = new Date()
    timer = null
    check = ->
      t2 = new Date()
      if (t2 - t) > (10 * 1000)
        window.clearTimeout(timer)
        timer = null
        console.log "Not all images were loaded!"
        return
      console.log "Checking to see if all images have been loaded..."
      if game.imageCollection.isLoaded()
        console.log "Yup, looks like all images are loaded now."
        window.clearTimeout(timer)
        timer = null
        fn()
      else
        timer = window.setTimeout check, 300
    check()

  _populateSidebar: ->
    game.imageCollection.each (image) =>
      @$sidebar.append image.getElement()

  _chooseMap: (mapName) ->
    if @currentMap
      @currentMap.detach()
      @currentMap.unload()
    else
      @$layerChooser.attr('disabled', '')

    map = game.mapCollection.get(mapName)
    map.setParent(@viewport)
    map.load()
    map.attach()
    @viewport.setMap(map)

    @currentLayer = 'foreground'

  _chooseLayer: (layerName) ->
    # grey out the current layer and prevent interaction with it
    @currentMap[@currentLayer].deactivate()
    @currentMap[layerName].activate()

editor.core = core

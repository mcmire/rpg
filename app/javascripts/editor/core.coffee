
define 'editor.core', ->
  meta = require('meta')
  keyboard = require('game.keyboard')
  require('editor.DragObject')

  LAYER_NAMES = ['fill', 'tiles']
  LAYER_KEYS = [
    keyboard.keys.KEY_1,
    keyboard.keys.KEY_2
  ]

  meta.def
    init: ->
      @keyboard = keyboard.init()
      @viewport = require('editor.viewport').init(this)
      @$sidebar = $('#editor-sidebar')
      @$mapChooser = $('#editor-map-chooser select')

      @_resizeUI()
      $(window).resize => @_resizeUI()

      @_loadImages()
      @_whenImagesLoaded =>
        @_populateMapObjects()
        @_initLayers()
        @_initToolbox()
        @viewport.loadMap()
        @_changeLayerTo(0)   # currentTool is already set

      # Block backspace from leaving the page
      $(window)
        .bind "keydown.editor.core", (evt) =>
          if @keyboard.isKeyPressed(evt, 'backspace')
            evt.preventDefault()

    getLayers: -> LAYER_NAMES

    getCurrentLayer: -> @currentLayer

    getCurrentLayerElem: ->
      @findLayer(@getCurrentLayer())

    # TODO: Move to viewport
    findLayer: (layer) ->
      @viewport.getMapLayers().find(".editor-layer[data-layer=#{layer}]")

    _resizeUI: ->
      win = $.viewport()
      wh  = win.height
      ww  = win.width
      nh  = $('#editor-nav').offset().height
      sw  = @$sidebar.offset().width
      @viewport.setWidth(ww - sw)
      h = wh - nh
      @viewport.setHeight(h)
      @$sidebar.height(h)

    _loadImages: ->
      require('game.imageCollection').load()

    _whenImagesLoaded: (fn) ->
      t = new Date()
      timer = null
      imageCollection = require('game.imageCollection')
      check = ->
        t2 = new Date()
        if (t2 - t) > (10 * 1000)
          window.clearTimeout(timer)
          timer = null
          console.log "Not all images were loaded!"
          return
        console.log "Checking to see if all images have been loaded..."
        if imageCollection.isLoaded()
          console.log "Yup, looks like all images are loaded now."
          window.clearTimeout(timer)
          timer = null
          fn()
        else
          timer = window.setTimeout check, 300
      check()

    _populateMapObjects: ->
      # go through all of the possible objects (images, sprites, mobs, etc.)
      # and add them to a list

      imageCollection = require('game.imageCollection')
      spriteCollection = require('game.spriteCollection')

      @objects = []
      @objectsByName = {}

      spriteCollection.each (sprite) =>
        name = sprite.name
        return if @objectsByName[name]
        dims = {w: sprite.width, h: sprite.height}
        obj =
          name: name
          dims: dims
          object: sprite
          image: sprite.image
        @objects.push(obj)
        @objectsByName[name] = obj
      imageCollection.each (image) =>
        name = image.name
        return if name is 'link2x'
        return if @objectsByName[name]
        dims = {w: image.width, h: image.height}
        obj =
          name: name
          dims: dims
          object: image
          image: image
        @objects.push(obj)
        @objectsByName[name] = obj

      @objects = @objects.sort (x1, x2) ->
        [d1, d2] = [x1.dims, x2.dims]
        # display objects side-by-side, sorted by height ascending
        [w1, h1] = [d1.w, d1.h].reverse()
        [w2, h2] = [d2.w, d2.h].reverse()
        if w1 > w2
          return 1
        else if w1 < w2
          return -1
        else if h1 > h2
          return 1
        else if h1 < h2
          return -1
        else
          return 0

      $.v.each @objects, (so) =>
        $elem = so.$elem = $("<div/>")
          .addClass('img')
          .data('name', so.object.name)
          .width(so.dims.w)
          .height(so.dims.h)
          .append(so.image.getElement())
        $elem.data('so', so)  # TODO: use a real object rather than this

    _populateSidebar: ->
      return if @sidebarPopulated

      elems = []
      $.v.each @objects, (so) =>
        @$sidebar.find('> div[data-layer=tiles]').append(so.$elem)
        elems.push(so.$elem[0])

      evtns = 'editor.core.sidebar'
      $(elems)
        .dragObject
          helper: true
          # TODO: Need to ensure that dropTarget can receive sidebar objects...
          # what if we switch to a different layer?
          dropTarget: @viewport.getElement()
        .bind "mousedragstart.#{evtns}", (evt) ->
          console.log "#{evtns}: mousedragstart"
          $draggee = $(this)
          dragObject = $draggee.data('dragObject')
          $helper = dragObject.getHelper()
          $helper.addClass('editor-map-object')

      @sidebarPopulated = true

    _initLayers: ->
      that = this

      @$layerChooser = $('#editor-layer-chooser select')
        .change -> that._selectLayer(@value)

      for layer in LAYER_NAMES
        @$sidebar.append """<div data-layer="#{layer}"></div>"""
        @$layerChooser.append """<option data-layer="#{layer}">#{layer}</option>"""
        @viewport.addLayer(layer)

      $(window).bind 'keyup', (evt) =>
        index = LAYER_KEYS.indexOf(evt.keyCode)
        @_changeLayerTo(index) unless index is -1

    _changeLayerTo: (index) ->
      @$layerChooser[0].selectedIndex = index
      @$layerChooser.change()

    _selectLayer: (layer) ->
      @_deactivateCurrentLayer()
      @currentLayer = layer
      @_activateCurrentLayer()

    _activateCurrentLayer: ->
      layer = @currentLayer

      # TODO: Move to viewport
      $layer = @viewport.$map.find(".editor-layer[data-layer=#{layer}]")
        .addClass('editor-layer-selected')
        .detach()
      # put on top of all other elements
      @viewport.getMapLayers().append($layer)
      $(document.body).addClass("editor-layer-#{layer}")

      @$sidebar.find("> div[data-layer=#{layer}]").show()

      m = "activate_#{layer}_layer"
      console.log "viewport: activating #{layer} layer"
      @viewport[m]?()
      console.log "core: activating #{layer} layer"
      @[m]?()
      @_activateCurrentTool()

    _deactivateCurrentLayer: ->
      layer = @currentLayer

      # TODO: Move to viewport
      @viewport.$map.find(".editor-layer[data-layer=#{layer}")
        .removeClass('editor-layer-selected')
      $(document.body).removeClass("editor-layer-#{layer}")

      @$sidebar.find("> div[data-layer=#{layer}]").hide()

      m = "deactivate_#{layer}_layer"
      if layer
        if @currentTool then @_deactivateCurrentTool()
        console.log "core: deactivating #{layer} layer"
        @[m]?()
        console.log "viewport: deactivating #{layer} layer"
        @viewport[m]?()

    _initToolbox: ->
      that = this
      @$toolbox = $('<div id="editor-toolbox"/>')
      @viewport.getElement().append(@$toolbox)
      @currentTool = null
      @prevTool = null

    _initTools: (tools) ->
      that = this
      evtns = 'editor.core.tools'

      @_destroyTools()

      $.v.each tools, (tool) =>
        $tool = $("""<img src="/images/editor/tool-#{tool}.gif" data-tool="#{tool}">""")
        @$toolbox.append($tool)
      @$toolbox.find('> img')
        .bind "click.#{evtns}", ->
          tool = $(this).data('tool')
          that._selectTool(tool)

      # @_selectTool('normal')
      @currentTool = 'normal'

      @_initHandTool() if $.includes(tools, 'hand')

    _destroyTools: ->
      evtns = 'editor.core.tools'
      @$toolbox.find('> img').unbind('.' + evtns)
      @$toolbox.html("")
      $(window).unbind('.' + evtns)

    _initHandTool: ->
      evtns = 'editor.core.tools'
      prevTool = null
      $(window)
        .bind "keydown.#{evtns}", (evt) =>
          if @keyboard.isKeyPressed(evt, 'shift')
            evt.preventDefault()
            prevTool = @currentTool
            @_selectTool('hand')
        .bind "keyup.#{evtns}", (evt) =>
          if @keyboard.isKeyUnpressed(evt, 'shift')
            @_selectTool(prevTool)
            prevTool = null

    _selectTool: (tool) ->
      @_deactivateCurrentTool()
      @currentTool = tool
      @_activateCurrentTool()

    _activateCurrentTool: ->
      $tool = @$toolbox.find("> [data-tool='#{@currentTool}']")
      $tool.addClass('editor-active')
      $(document.body).addClass("editor-tool-#{@currentTool}")

      m1 = "activate_#{@currentTool}_tool"
      m2 = "activate_#{@currentLayer}_#{@currentTool}_tool"
      console.log "viewport: activating #{@currentTool} tool"
      @viewport[m1]?()
      console.log "core: activating #{@currentTool} tool"
      @[m1]?()
      # it's important the viewport get init'ed first here because the viewport
      # has to be augmented as a dropTarget first before augmenting the sidebar
      # elements as dragObjects
      console.log "viewport: activating #{@currentTool} tool (layer: #{@currentLayer})"
      @viewport[m2]?()
      console.log "core: activating #{@currentTool} tool (layer: #{@currentLayer})"
      @[m2]?()

    _deactivateCurrentTool: ->
      $tool = @$toolbox.find("> [data-tool='#{@currentTool}']")
      $tool.removeClass('editor-active')
      $(document.body).removeClass("editor-tool-#{@currentTool}")

      m1 = "deactivate_#{@currentTool}_tool"
      m2 = "deactivate_#{@currentLayer}_#{@currentTool}_tool"
      if @currentTool
        if @currentLayer
          console.log "core: deactivating #{@currentTool} tool (layer: #{@currentLayer})"
          @[m2]?()
          console.log "viewport: deactivating #{@currentTool} tool (layer: #{@currentLayer})"
          @viewport[m2]?()
        console.log "core: deactivating #{@currentTool} tool"
        @[m1]?()
        console.log "viewport: deactivating #{@currentTool} tool"
        @viewport[m1]?()

    activate_fill_layer: ->
      # we want normal, hand, select tools
      # - normal tool will select areas so you can delete them and enable moving
      #   objects
      # - hand tool will move the map around
      # - select tool will let you select an area on the map
      #
      # in addition selecting the fill layer will populate the sidebar with a
      # color picker

      @_initTools ['normal', 'hand', 'select']

    activate_tiles_layer: ->
      # we want normal and hand tools
      # - normal tool will select tiles so you can delete them and enable moving
      #   tiles
      # - hand tool will move the map around
      #
      # in addition selecting the tiles layer will populate the sidebar with the
      # list of available tiles

      @_initTools ['normal', 'hand']

    activate_tiles_normal_tool: ->
      @_populateSidebar()

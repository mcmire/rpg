
define 'editor.core', ->
  meta = require('meta')
  util = require('util')

  meta.def
    _createMapGrid: ->
      # create the grid pattern that backgrounds the map
      canvas = require('game.canvas').create(16, 16)
      ctx = canvas.getContext()
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(16, 0.5)
      ctx.moveTo(0.5, 0.5)
      ctx.lineTo(0.5, 16)
      ctx.stroke()
      @mapGrid = canvas

    init: ->
      that = this

      ONE_KEY = 49
      TWO_KEY = 50

      @_createMapGrid()

      @layers =
        names: ['fill', 'tiles']
        keys: [ONE_KEY, TWO_KEY]
        init: ->
          that.$layerChooser[0].selectedIndex = 1
          that.$layerChooser.change()
        choose: (layer) ->
          if @current
            if that.currentTool
              # also deactivate the tool since that's a member of the layer
              that["_deactivate_#{@current}_#{that.currentTool}_tool"]?()
            that["_deactivate_#{@current}_layer"]?()

          @current = layer
          $map = that.viewport.$map

          $layer = $map.find('.editor-layer').removeClass('editor-layer-selected')
          $layer.find('.editor-layer-content').css('background', 'none')
          $layer.find('.editor-layer-bg').css('background', 'none')

          $layer = $map.find(".editor-layer[data-layer=#{layer}]")
            .addClass('editor-layer-selected')
          $layer.find('.editor-layer-content')
            .css('background-image', "url(#{that.mapGrid.element.toDataURL()})")
            .css('background-repeat', 'repeat')
          $layer.find('.editor-layer-bg')
            .css('background-color', 'white')

          that.$sidebar.find('> div').hide()
          that.$sidebar.find("> div[data-layer=#{layer}]").show()

          that["_activate_#{@current}_layer"]?()
          # also activate the tool since that's a member of the layer
          that["_activate_#{@current}_#{that.currentTool}_tool"]?()

      $(window).bind 'keyup', (evt) =>
        index = @layers.keys.indexOf(evt.keyCode)
        if index isnt -1
          @$layerChooser[0].selectedIndex = index
          @$layerChooser.change()

      @viewport = require('editor.viewport').init(this)

      @$sidebar = $('#editor-sidebar')
      for layer in @layers.names
        @$sidebar.append """<div data-layer="#{layer}"></div>"""

      @$layerChooser = $('#editor-layer-chooser select')
        .change -> that.layers.choose(@value)
      for layer in @layers.names
        @$layerChooser.append """<option data-layer="#{layer}">#{layer}</option>"""

      @$mapChooser = $('#editor-map-chooser select')

      @_resizeUI()
      $(window).resize => @_resizeUI()

      @_loadImages()
      @_whenImagesLoaded =>
        @_populateSidebar()
        # @$mapChooser.change => @_chooseMap(@value)

        @viewport.loadMap()
        @_initToolbox()
        @layers.init()

    getLayers: -> @layers.names

    getCurrentLayer: -> @layers.current

    getCurrentLayerElem: -> @findLayer @getCurrentLayer()

    findLayer: (layer) -> @viewport.$map.find(".editor-layer[data-layer=#{layer}]")

    enableDragSnapping: (size) ->
      @snapDragToGrid = size

    disableDragSnapping: ->
      @snapDragToGrid = null

    rememberDragObject: ([@$elemBeingDragged, @objectBeingDragged]) ->
      $(document.body).append(@$elemBeingDragged)

    forgetDragObject: ->
      [a, b] = [@$elemBeingDragged, @objectBeingDragged]
      @$elemBeingDragged.remove()
      delete @$elemBeingDragged
      delete @objectBeingDragged
      return [a, b]

    positionDragHelper: (evt) ->
      x = evt.pageX - @dragOffset.x
      y = evt.pageY - @dragOffset.y
      @$elemBeingDragged.css('top', "#{y}px").css('left', "#{x}px")

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

    _populateSidebar: ->
      core = this

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

      dragStarted = false
      @dragOffset = null
      @$elemBeingDragged = null
      @objectBeingDragged = null

      elems = []
      $.v.each @objects, (so) =>
        $elem = so.$elem = $("<div/>")
          .addClass('img')
          .data('name', so.object.name)
          .width(so.dims.w)
          .height(so.dims.h)
          .append(so.image.getElement())
        $elem.data('so', so)  # TODO: use a real object rather than this
        @$sidebar.find('> div[data-layer=tiles]').append($elem)
        elems.push($elem[0])

      # NEW CODE
      evtns = 'editor.core.sidebar'
      $(elems)
        .dragObject
          helper: true
          # TODO: Need to ensure that dropTarget can receive sidebar objects...
          # what if we switch to a different layer?
          dropTarget: @viewport.$element
        .bind "mousedragstart.#{evtns}", (evt) ->
          console.log "#{evtns}: mousedragstart"
          $draggee = $(this)
          dragObject = $draggee.data('dragObject')
          $helper = dragObject.getHelper()
          $helper.addClass('editor-map-object')
        .bind "mousedrop.#{evtns}", (evt) =>
          console.log "#{evtns}: mousedrop"
          $draggee = $(this)
          x = parseInt($draggee.css('left'), 10)
          y = parseInt($draggee.css('top'), 10)
          x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          $draggee.moveTo(x, y)

      # OLD CODE
      ###
      $(elems)
        .bind "mousedown.#{evtNamespace}", (evt) ->
          # don't move the object accidentally if it is right-clicked
          # FIXME so this handles ctrl-click too
          return if evt.button is 2

          $this = $(this)

          # console.log 'img mousedown'

          evt.preventDefault()

          $(window)
            # bind mousemove to the window as we can drag the image around
            # wherever we want, not just within the sidebar or viewport
            .bind "mousemove.#{evtNamespace}", (evt) ->
              # console.log 'mousemove while mousedown'
              unless dragStarted
                $this.trigger "mousedragstart.#{evtNamespace}", evt
                dragStarted = true
              if core.$elemBeingDragged
                core.positionDragHelper(evt)
              else
                # viewport has stolen $elemBeingDragged

            # bind mouseup to the window as it may occur outside of the image
            .one "mouseup.#{evtNamespace}", (evt) ->
              console.log 'core: mouseup'
              if dragStarted
                $this.trigger "mousedragend.#{evtNamespace}", evt
              $(window).unbind "mousemove.#{evtNamespace}"
              dragStarted = false
              core.dragOffset = null
              return true

        .bind "mousedragstart.#{evtNamespace}", (evt) ->
          console.log 'core: mousedragstart'
          $this = $(this)
          # clone the image node
          $elemBeingDragged = $(this.cloneNode(true))
            .addClass('editor-map-object')
            .addClass('editor-drag-helper')
            .removeClass('img')
          core.rememberDragObject([$elemBeingDragged, $this.data('so')])
          $(document.body).addClass('editor-drag-active')
          offset = $this.offset()
          core.dragOffset =
            x: evt.pageX - offset.left
            y: evt.pageY - offset.top
          core.viewport.bindDndEvents()

        .bind "mousedragend.#{evtNamespace}", (evt) ->
          console.log 'core: mousedragend'
          core.viewport.unbindDndEvents()
          $(document.body).removeClass('editor-drag-active')
          core.forgetDragObject() if core.$elemBeingDragged
      ###

    _chooseMap: (mapName) ->
      if @currentMap
        @currentMap.detach()
        @currentMap.unload()
      else
        @$layerChooser.attr('disabled', '')

      map = require('game.mapCollection').get(mapName)
      map.setParent(@viewport)
      map.load()
      map.attach()
      @viewport.setMap(map)

      @currentLayer = 'foreground'

    _initToolbox: ->
      that = this
      @$toolbox = $('<div id="editor-toolbox"/>')
      @viewport.$element.append(@$toolbox)
      @currentTool = null
      @prevTool = null

    _initTools: (tools) ->
      evtNamespace = 'editor.core.tools'

      @_destroyTools()

      $.v.each tools, (tool) =>
        $tool = $("""<img src="/images/editor/tool-#{tool}.gif" data-tool="#{tool}">""")
        @$toolbox.append($tool)
      @$toolbox.find('> img')
        .bind "click.#{evtNamespace}", =>
          tool = $(this).data('tool')
          @_selectTool(tool)

      @_selectTool('normal')

      @_initHandTool() if $.includes(tools, 'hand')

    _destroyTools: ->
      evtNamespace = 'editor.core.tools'
      @$toolbox.find('> img').unbind('.' + evtNamespace)
      $(window).unbind('.' + evtNamespace)
      @$toolbox.html("")

    _initHandTool: ->
      evtNamespace = 'editor.core.tools'
      SHIFT_KEY = 16
      CTRL_KEY = 17
      mouse = {}
      $(window)
        .bind "keydown.#{evtNamespace}", (evt) =>
          if evt.keyCode is SHIFT_KEY
            @prevTool = @currentTool
            @_selectTool('hand')
            evt.preventDefault()
        .bind "keyup.#{evtNamespace}", (evt) =>
          if evt.keyCode is SHIFT_KEY
            @_selectTool(@prevTool)
            @prevTool = null
        .bind "mousemove.#{evtNamespace}", (evt) =>
          mouse.x = evt.pageX
          mouse.y = evt.pageY

    _selectTool: (tool) ->
      $tool = @$toolbox.find("> [data-tool='#{tool}']")
      @$toolbox.find('> img').removeClass('editor-active')
      $tool.addClass('editor-active')
      @viewport.$element
        .removeClassesLike(/^editor-tool-/)
        .addClass("editor-tool-#{tool}")

      if @currentTool
        @["_deactivate_#{@currentLayer}_#{@currentTool}_tool"]?()
        @["_deactivate_#{@currentTool}_tool"]?()
      @currentTool = tool
      @["_activate_#{@currentLayer}_#{@currentTool}_tool"]?()
      @["_activate_#{@currentTool}_tool"]?()

    _activate_fill_layer: ->
      console.log 'core: activating fill layer'

      # we want normal, hand, select, and bucket tools
      # - normal tool will select areas so you can delete them and enable moving
      #   objects
      # - hand tool will move the map around
      # - select tool will let you select an area on the map
      # - bucket tool will let you fill in that area with a color - filling in an
      #   area will create it - or you can fill the entire map with a color
      #
      # in addition selecting the fill layer will populate the sidebar with a
      # color picker

      @_initTools ['normal', 'hand', 'select', 'bucket']

    _activate_tiles_layer: ->
      console.log 'core: activating tiles layer'

      # we want normal and hand tools
      # - normal tool will select tiles so you can delete them and enable moving
      #   tiles
      # - hand tool will move the map around
      #
      # in addition selecting the tiles layer will populate the sidebar with the
      # list of available tiles

      @_initTools ['normal', 'hand']

    _activate_tiles_normal_tool: ->
      console.log 'core: activating normal tool (layer: tiles)'
      @viewport.activate_tiles_normal_tool()

    _deactivate_tiles_normal_tool: ->
      console.log 'core: deactivating normal tool (layer: tiles)'
      @viewport.deactivate_tiles_normal_tool()

    _activate_tiles_hand_tool: ->
      console.log 'core: activating hand tool (layer: tiles)'
      @viewport.activate_tiles_hand_tool()

    _deactivate_tiles_hand_tool: ->
      console.log 'core: deactivating hand tool (layer: tiles)'
      @viewport.deactivate_tiles_hand_tool()

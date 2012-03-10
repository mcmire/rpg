
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
          that.$layerChooser[0].selectedIndex = 0
          that.$layerChooser.change()
        choose: (layer) ->
          if @current
            if @current is 'fill'
              @deactivateFillLayer()
            else if @current is 'tiles'
              @deactivateTilesLayer()

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

          if @current is 'fill'
            @_activateFillLayer()
          else if @current is 'tiles'
            @_activateTilesLayer()

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

      @layers.init()

      @$mapChooser = $('#editor-map-chooser select')

      @_resizeUI()
      $(window).resize => @_resizeUI()

      @_loadImages()
      @_whenImagesLoaded =>
        @_populateSidebar()
        # @$mapChooser.change => @_chooseMap(@value)

        @viewport.loadMap()
        @_initToolbox()

    getLayers: -> @layers.names

    getCurrentLayer: -> @layers.current

    getCurrentLayerElem: -> @viewport.$map.find(".editor-layer[data-layer=#{@layers.current}]")

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

      $.v.each @objects, (so) =>
        $div = so.$elem = $("<div/>")
          .addClass('img')
          .data('name', so.object.name)
          .width(so.dims.w)
          .height(so.dims.h)
          .append(so.image.getElement())

          .bind 'mousedown.editor.core', (evt) =>
            # don't move the object accidentally if it is right-clicked
            # FIXME so this handles ctrl-click too
            return if evt.button is 2

            # console.log 'img mousedown'

            evt.preventDefault()

            # bind mousemove to the window as we can drag the image around
            # wherever we want, not just within the sidebar or viewport
            $(window).bind 'mousemove.editor.core', (evt) =>
              # console.log 'mousemove while mousedown'
              unless dragStarted
                $div.trigger 'mousedragstart.editor.core', evt
                dragStarted = true
              if @$elemBeingDragged
                @positionDragHelper(evt)
              else
                # viewport has stolen $elemBeingDragged

            # bind mouseup to the window as it may occur outside of the image
            $(window).one 'mouseup.editor.core', (evt) =>
              console.log 'core mouseup'
              if dragStarted
                $div.trigger 'mousedragend.editor.core', evt
              $(window).unbind 'mousemove.editor.core'
              dragStarted = false
              @dragOffset = null
              return true

          .bind 'mousedragstart.editor.core', (evt) =>
            console.log 'core mousedragstart'
            # clone the image node
            $elemBeingDragged = $($div[0].cloneNode(true))
              .addClass('editor-map-object')
              .addClass('editor-drag-helper')
              .removeClass('img')
            @rememberDragObject([$elemBeingDragged, so])
            $(document.body).addClass('editor-drag-active')
            offset = $div.offset()
            @dragOffset =
              x: evt.pageX - offset.left
              y: evt.pageY - offset.top
            @viewport.bindDragEvents()

          .bind 'mousedragend.editor.core', (evt) =>
            console.log 'core mousedragend'
            @viewport.unbindDragEvents()
            $(document.body).removeClass('editor-drag-active')
            @forgetDragObject() if @$elemBeingDragged

        @$sidebar.find('> div[data-layer=tiles]').append($div)

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

    _chooseLayer: (layerName) ->
      # grey out the current layer and prevent interaction with it
      @currentMap[@currentLayer].deactivate()
      @currentMap[layerName].activate()

    _initToolbox: ->
      that = this
      @$toolbox = $('<div id="editor-toolbox"/>')
      @viewport.$element.append(@$toolbox)
      @currentTool = null
      prevTool = null

      selectTool = (tool) =>
        $tool = @$toolbox.find("> [data-tool='#{tool}']")
        $tools.removeClass('editor-active')
        $tool.addClass('editor-active')
        @viewport.$element
          .removeClassesLike(/^editor-tool-/)
          .addClass("editor-tool-#{tool}")

        if @currentTool is 'normal'
          @_deactivateNormalTool()
        if @currentTool is 'hand'
          @_deactivateHandTool()

        @currentTool = tool

        if @currentTool is 'normal'
          @_activateNormalTool()
        if @currentTool is 'hand'
          @_activateHandTool()

      tools = 'normal hand select bucket'.split(" ")
      $.v.each tools, (tool) =>
        $tool = $("""<img src="/images/editor/tool-#{tool}.gif" data-tool="#{tool}">""")
        @$toolbox.append($tool)
      $tools = @$toolbox.find('> img')
        .bind 'click.editor', ->
          tool = $(this).data('tool')
          selectTool(tool)

      selectTool('normal')

      SHIFT_KEY = 16
      CTRL_KEY = 17
      mouse = {}
      # http://stackoverflow.com/questions/3898524/how-to-show-mouse-cursor-in-browser-while-typing
      # $cursor = null
      $(window)
        .bind 'keydown.editor.core', (evt) =>
          if evt.keyCode is SHIFT_KEY
            prevTool = @currentTool
            selectTool('hand')
            evt.preventDefault()
          # unless $cursor
          #   $cursor = $("""<img id="editor-sticky-cursor" src="/images/editor/tool-#{@currentTool}.gif">""")
          #   $(document.body).append($cursor)
          #   $cursor.moveTo(mouse.x, mouse.y)
        .bind 'keyup.editor.core', (evt) =>
          if evt.keyCode is SHIFT_KEY
            selectTool(prevTool)
            prevTool = null
        .bind 'mousemove.editor.core', (evt) =>
          mouse.x = evt.pageX
          mouse.y = evt.pageY
          # if $cursor
          #   $cursor.remove()
          #   $cursor = null

  _activateNormalTool: ->
    @viewport.activateNormalTool()

  _deactivateNormalTool: ->
    @viewport.deactivateNormalTool()

  _activateHandTool: ->
    @viewport.activateHandTool()

  _deactivateHandTool: ->
    @viewport.deactivateHandTool()

  _activateFillLayer: ->
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

  _activateTilesLayer: ->
    # we want normal and hand tools
    # - normal tool will select tiles so you can delete them and enable moving
    #   tiles
    # - hand tool will move the map around
    #
    # in addition selecting the tiles layer will populate the sidebar with the
    # list of available tiles

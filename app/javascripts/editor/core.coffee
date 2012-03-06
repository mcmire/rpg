
define 'editor.core', ->
  meta = require('meta')
  util = require('util')

  meta.def
    init: ->
      @viewport = require('editor.viewport').init(this)
      @$sidebar = $('#editor-sidebar')
      @$mapChooser = $('#editor-map-chooser select')
      @$layerChooser = $('#editor-layer-chooser select')
        .attr('disabled', 'disabled')

      @_resizeUI()
      $(window).resize => @_resizeUI()

      @_loadImages()
      @_whenImagesLoaded =>
        @_populateSidebar()
        # @$mapChooser.change => @_chooseMap(@value)
        # @$layerChooser.change => @_chooseLayer(@value)

        @viewport.loadMap()

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
              .addClass('drag-helper')
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

        @$sidebar.append($div)

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

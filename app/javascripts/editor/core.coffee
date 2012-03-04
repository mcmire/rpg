
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

      @viewport.newMap()

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
      x = Math.round(evt.pageX - (@objectBeingDragged.dims.w/2))
      y = Math.round(evt.pageY - (@objectBeingDragged.dims.h/2))
      @$elemBeingDragged.css('top', "#{y}px").css('left', "#{x}px")

    _resizeUI: ->
      wh = $(window).height()
      ww = $(window).width()
      nh = $('#editor-nav').height()
      sw = @$sidebar.width()
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

      objects = []
      names = {}

      spriteCollection.each (sprite) ->
        return if names[sprite.name]
        dims = {w: sprite.width, h: sprite.height}
        objects.push {dims: dims, object: sprite, image: sprite.image}
        names[sprite.name] = 1
      imageCollection.each (image) ->
        return if image.name is 'link2x'
        return if names[image.name]
        dims = {w: image.width, h: image.height}
        objects.push {dims: dims, object: image, image: image}
        names[image.name] = 1

      objects = objects.sort (x1, x2) ->
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

      dragOccurred = false
      @$elemBeingDragged = null
      @objectBeingDragged = null

      $.v.each objects, (so) =>
        $div = $("<div/>")
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
              unless dragOccurred
                $div.trigger 'dragstart.editor.core', evt
                dragOccurred = true
              if @$elemBeingDragged
                @positionDragHelper(evt)
              else
                # viewport has stolen $elemBeingDragged

            # bind mouseup to the window as it may occur outside of the image
            $(window).one 'mouseup.editor.core', (evt) =>
              console.log 'core mouseup'
              if dragOccurred
                $div.trigger 'dragend.editor.core', evt
              $(window).unbind 'mousemove.editor.core'
              dragOccurred = false
              return true

          .bind 'dragstart.editor.core', (evt) =>
            console.log 'core dragstart'
            # clone the image node
            $elemBeingDragged = $($div[0].cloneNode(true))
              .attr('id', 'editor-drag-clone')
              .removeClass('img')
            @rememberDragObject([$elemBeingDragged, so])
            $(document.body).addClass('editor-drag-active')
            @viewport.bindDragEvents()

          .bind 'dragend.editor.core', (evt) =>
            console.log 'core dragend'
            # @viewport.unbindDragEvents()
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

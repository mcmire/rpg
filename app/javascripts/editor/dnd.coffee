
define 'editor.dnd', ->
  meta = require('meta')

  dnd =
    startDraggingWith: (@dragObject) ->
    stopDragging: -> @dragObject = null

  DragObject = do ->
    EVT_NS = 'dnd.dragObject'

    meta.def
      init: (elem, options={}) ->
        that = this

        @$elem = $(elem)
        @options = options
        if @options.dropTarget
          @dropTargetOffset = @options.dropTarget.offset()

        @dragOffset = null

        @$elem
          .bind "mousedown.#{EVT_NS}", (evt) =>
            @_debugEvent 'elem mousedown'
            # don't move the object accidentally if it is right-clicked
            # FIXME so this handles ctrl-click too
            return if evt.button is 2
            evt.preventDefault()
            @_addWindowEvents()

          .bind "mousedragstart.#{EVT_NS}", (evt) =>
            @_debugEvent 'elem mousedragstart'
            $(document.body).addClass('editor-drag-active')
            elemOffset = @$elem.offset()
            @dragOffset =
              x: evt.pageX - elemOffset.left
              y: evt.pageY - elemOffset.top
            @options.dropTarget?.dropTarget('activate', this)
            dnd.startDraggingWith(this)

          .bind "mousedragend.#{EVT_NS}", (evt) =>
            @_debugEvent 'elem mousedragend'
            $(document.body).removeClass('editor-drag-active')
            @dragOffset = null
            @options.dropTarget?.dropTarget('deactivate', this)
            dnd.stopDragging()

          # XXX: This was moved to core
          #.bind "mousedrop.#{EVT_NS}", (evt) =>
          #  @_debugEvent 'elem mousedrop'
          #  x = parseInt(@$elem.css('left'), 10)
          #  y = parseInt(@$elem.css('top'), 10)
          #  x = Math.round(x / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          #  y = Math.round(y / DRAG_SNAP_GRID_SIZE) * DRAG_SNAP_GRID_SIZE
          #  @$elem.moveTo(x, y)

        if @options.helper
          @_addEventsWithHelper()
        else
          @_addEventsWithoutHelper()

      position: (evt) ->
        $elem = if @options.helper then @$helper else @$elem
        x = evt.pageX - @dragOffset.x
        y = evt.pageY - @dragOffset.y
        if @isOverDropTarget
          x -= @dropTargetOffset.left
          y -= @dropTargetOffset.top
        $elem.moveTo(x, y)

      getDraggee: ->
        if @options.helper then @$helper else @$elem

      getElement: -> @$elem

      getHelper: -> @$helper

      setOverDropTarget: ->
        @isOverDropTarget = true

      setOutsideDropTarget: ->
        @isOverDropTarget = false

      _addEventsWithHelper: ->
        @$elem
          .bind "mousedragstart.#{EVT_NS}", (evt) =>
            @_debugEvent 'elem mousedragstart 2'

            @$helper = @$elem.clone()
            @$helper.addClass('editor-drag-helper')
            $(document.body).append(@$helper)

          # mouse up outside of drop target
          # TODO: Call this somewhere
          .bind "mousedropcancel.#{EVT_NS}", (evt) =>
            @_debugEvent 'helper mousedropcancel'
            @$helper.remove()
            @$helper = null

          # mouse over drop target
          # TODO: Need to make sure if this fires before dropTarget
          # mousedragover or after
          .bind "mousedropover.#{EVT_NS}", (evt) =>
            @_debugEvent 'helper mousedropover'
            @$helper.removeClass('editor-drag-helper').detach()
            # the dropTarget will now take over this object

          # mouse out of drop target
          # TODO: Need to make sure if this fires before dropTarget
          # mousedragout or after
          .bind "mousedropout.#{EVT_NS}", (evt) =>
            @_debugEvent 'helper mousedropout'
            # the dropTarget should have given up this object
            @$helper.addClass('editor-drag-helper')
            $(document.body).append(@$helper)

            # call this preemptively to prevent a jump when dragging an
            # object back out of the viewport
            @position(evt)

          .bind "mousedrag.#{EVT_NS}", (evt) =>
            # @_debugEvent 'mousedrag'
            @position(evt)

      _addEventsWithoutHelper: ->
        @$elem
          .bind "mousedrag.#{EVT_NS}", (evt) =>
            @position(evt)

      _addWindowEvents: ->
        console.log 'addWindowEvents'
        @dragStarted = false

        @_addMousemoveEvent()

        # bind mouseup to the window as it may occur outside of the image
        $(window).one "mouseup.#{EVT_NS}", (evt) =>
          @_debugEvent 'window mouseup'
          if @dragStarted
            @$elem.trigger 'mousedragend', evt
            # TODO: This should trigger only outside of the drop target
            @$elem.trigger 'mousedropcancel', evt
          @_removeWindowEvents()

      _addMousemoveEvent: ->
        # bind mousemove to the window as we can drag the image around
        # wherever we want, not just within the sidebar or viewport
        $(window).bind "mousemove.#{EVT_NS}", (evt) =>
          # @_debugEvent 'window mousemove'
          if not @dragStarted
            @dragStarted = true
            @$elem.trigger "mousedragstart", evt

          if @dragStarted
            @$elem.trigger "mousedrag", evt
          else
            evt.preventDefault()

      _removeMousemoveEvent: ->
        $(window).unbind "mousemove.#{EVT_NS}"

      _removeWindowEvents: ->
        console.log 'removeWindowEvents'
        @dragStarted = false
        $(window).unbind ".#{EVT_NS}"

      _debugEvent: (name) ->
        desc = if @options.helper then '(map object)' else '(helper)'
        console.log "#{EVT_NS}: #{name} (#{desc})"

  DropTarget = do ->
    EVT_NS = 'dnd.dropTarget'

    meta.def
      init: (sensor, options={}) ->
        @$sensor = $(sensor)
        @options = options
        @$receptor =
          if options.receptor
            $(options.receptor)
          else
            @$sensor
        unless @$sensor.length
          throw new Error "DropTarget#init: sensor element doesn't exist"
        unless @$receptor.length
          throw new Error "DropTarget#init: receptor element doesn't exist"

        offset = @$sensor.offset()
        @x1 = offset.left
        @x2 = offset.left + offset.width
        @y1 = offset.top
        @y2 = offset.top + offset.height

      activate: (dragObject) ->
        console.log 'activate'

        mouseLocation = null
        $dragOwner = null
        $dragHelper = null

        # bind mousemove to to the window instead of the viewport - it kinda
        # sucks but binding to the viewport won't work as the mouse is already
        # on top of the drag helper when it is dragged into the viewport
        $(window)
          .bind "mousemove.#{EVT_NS}", (evt) =>
            # @_debugEvent 'elem mousemove'
            $dragOwner  ||= dragObject.getElement()
            $dragHelper ||= dragObject.getHelper()
            if @_mouseWithinSensor(evt)
              console.log 'mouse within sensor'
              if mouseLocation isnt 'inside'
                console.log "mouseLocation: #{mouseLocation}"
                # fire only the first time
                $dragOwner.trigger "mousedropover", evt
                @$sensor.trigger "mousedragover", evt
                mouseLocation = 'inside'
              @$sensor.trigger "mousedragwithin", evt
            else if mouseLocation is 'inside'
              # fire only the first time, and only if we've
              # already fired dragover
              @$sensor.trigger "mousedragout", evt
              $dragOwner.trigger "mousedropout", evt
              mouseLocation = 'outside'

        @$sensor
          .one "mouseup.#{EVT_NS}", (evt) =>
            @_debugEvent 'elem mouseup'
            evt.relatedTarget = $dragOwner[0]
            @$sensor.trigger "mousedropwithin", evt
            $dragOwner.trigger "mousedrop", evt

          # TODO: Need to make sure if this fires before $dragOwner mousedropover
          # or after
          .bind "mousedragover.#{EVT_NS}", (evt) =>
            @_debugEvent 'elem mousedragover'
            @$receptor.append($dragHelper)
            dragObject.setOverDropTarget()
            # call this preemptively to prevent a jump when first dragging an
            # object into the viewport
            dragObject.position(evt)

          # TODO: Need to make sure if this fires before $dragOwner mousedropout
          # or after
          .bind "mousedragout.#{EVT_NS}", (evt) =>
            @_debugEvent 'elem mousedragout'
            dragObject.setOutsideDropTarget()
            $dragHelper.detach()

      deactivate: ->
        $(window).unbind ".#{EVT_NS}"
        @$sensor.unbind ".#{EVT_NS}"

      _mouseWithinSensor: (evt) ->
        (@x1 <= evt.pageX <= @x2 and @y1 <= evt.pageY <= @y2)

      _debugEvent: (name) ->
        console.log "#{EVT_NS}: #{name}"

  enderMethods =
    dragObject: (args...) ->
      @each ->
        $this = $(this)
        dragObject = $this.data('dragObject')
        unless dragObject
          options = args[0] || {}
          if options and not $.v.is.obj(options)
            throw new Error "Usage: $(...).dragObject([options])"
          dragObject = DragObject.create(this, options)
          $this.data('dragObject', dragObject)
        if typeof args[0] is 'string'
          method = args.shift()
          if typeof dragObject[method] is 'function'
            dragObject[method](args...)

    dropTarget: (args...) ->
      @each ->
        $this = $(this)
        dropTarget = $this.data('dropTarget')
        unless dropTarget
          options = args[0] || {}
          if options and not $.v.is.obj(options)
            throw new Error "Usage: $(...).dropTarget([options])"
          dropTarget = DropTarget.create(this, options)
          $this.data('dropTarget', dropTarget)
        if typeof args[0] is 'string'
          method = args.shift()
          if typeof dropTarget[method] is 'function'
            dropTarget[method](args...)

  $.ender(enderMethods, true)

  return dnd

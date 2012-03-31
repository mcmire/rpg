
define 'editor.DragObject', ->
  meta = require('meta')
  dnd = require('editor.dnd')

  EVT_NS = 'dnd.dragObject'

  DragObject = meta.def
    init: (elem, options={}) ->
      that = this

      @$elem = $(elem)
      @offset = @$elem.offset()

      @options = options
      if options.dropTarget
        $dropTarget = $(options.dropTarget)
        @dropTarget = $dropTarget.data('dropTarget')
        if not @dropTarget
          throw new Error "DragObject#init: Drop target does not exist"

      @dragOffset = null

      @$elem
        .bind "mousedown.#{EVT_NS}", (evt) =>
          @_logEvent @$elem, 'elem mousedown'
          # don't move the object accidentally if it is right-clicked
          # FIXME so this handles ctrl-click too
          return if evt.button is 2
          evt.preventDefault()
          @_addWindowEvents()

        .bind "mouseup.#{EVT_NS}", (evt) =>
          @_logEvent @$elem, 'elem mouseup'
          if not @dragStarted
            @$elem.trigger 'mouseupnodrag', evt

        .bind "mousedragstart.#{EVT_NS}", (evt) =>
          @_logEvent @$elem, 'elem mousedragstart'
          $(document.body).addClass('editor-drag-active')
          elemOffset = @$elem.offset()
          console.log "setting dragOffset on #{@$elem.data('node-uid')}"
          @dragOffset =
            x: evt.pageX - elemOffset.left
            y: evt.pageY - elemOffset.top
          dnd.startDraggingWith(this)

          if @options.helper
            @_addDragEventsWithHelper()
          else
            @_addDragEventsWithoutHelper()

          if @dropTarget
            evt.relatedTarget = @$elem[0]
            @dropTarget.getSensor().trigger('dropopen', evt)

          @$elem.one "mousedragend.#{EVT_NS}", (evt) =>
            @_logEvent @$elem, 'elem mousedragend'
            $(document.body).removeClass('editor-drag-active')
            @dragOffset = null
            if @dropTarget
              evt.relatedTarget = @$elem[0]
              @dropTarget.getSensor().trigger('dropclose', evt)
            dnd.stopDragging()

            if @options.helper
              @_removeDragEventsWithHelper()
            else
              @_removeDragEventsWithoutHelper()

    destroy: ->
      @$elem.unbind(".#{EVT_NS}")
      $(window).unbind(".#{EVT_NS}")

    position: (evt) ->
      $elem = if @options.helper then @$helper else @$elem
      if not @dragOffset
        console.log "accessing dragOffset on #{@$elem.data('node-uid')}"
        throw new Error 'dragOffset is not defined'
      x = evt.pageX - @dragOffset.x
      y = evt.pageY - @dragOffset.y
      if @dropTarget
        # have to recalculate this since it might have changed
        # TODO: Cache this somewhere...
        dropTargetOffset = @dropTarget.getReceptor().offset()
        if @isOverDropTarget
          x -= dropTargetOffset.left
          y -= dropTargetOffset.top
        if @options.containWithinDropTarget
          if x < 0
            x = 0
          else if (x + @offset.width) > dropTargetOffset.width
            x = (dropTargetOffset.width - @offset.width)
          if y < 0
            y = 0
          else if (y + @offset.height) > dropTargetOffset.height
            y = (dropTargetOffset.height - @offset.height)
      $elem.moveTo(x, y)

    getDraggee: ->
      if @options.helper then @$helper else @$elem

    getElement: -> @$elem

    getHelper: -> @$helper

    setInsideDropTarget: ->
      @isOverDropTarget = true

    setOutsideDropTarget: ->
      @isOverDropTarget = false

    _addDragEventsWithHelper: ->
      @$helper = @$elem.clone()
      @$helper.addClass('editor-drag-helper')
      $(document.body).append(@$helper)

      @$elem
        # mouse up outside of drop target
        # TODO: Call this somewhere
        .one "mousedropcancel.#{EVT_NS}", (evt) =>
          @_logEvent @$elem, 'helper mousedropcancel'
          @$helper.remove()
          @$helper = null

        # mouse over drop target
        # TODO: Need to make sure if this fires before dropTarget
        # mousedragover or after
        .bind "mousedropover.#{EVT_NS}", (evt) =>
          @_logEvent @$elem, 'helper mousedropover'
          @$helper.removeClass('editor-drag-helper').detach()
          # the dropTarget will now take over this object

        # mouse out of drop target
        # TODO: Need to make sure if this fires before dropTarget
        # mousedragout or after
        .bind "mousedropout.#{EVT_NS}", (evt) =>
          @_logEvent @$elem, 'helper mousedropout'
          # the dropTarget should have given up this object
          @$helper.addClass('editor-drag-helper')
          $(document.body).append(@$helper)

          # call this preemptively to prevent a jump when dragging an
          # object back out of the viewport
          @position(evt)

        .bind "mousedrag.#{EVT_NS}", (evt) =>
          # @_logEvent 'mousedrag'
          @position(evt)

    _removeDragEventsWithHelper: ->
      @$elem.unbind [
        "mousedropover.#{EVT_NS}",
        "mousedropout.#{EVT_NS}"
      ].join(" ")

    _addDragEventsWithoutHelper: ->
      @$elem
        .bind "mousedrag.#{EVT_NS}", (evt) =>
          @position(evt)

    _removeDragEventsWithoutHelper: ->
      @$elem.unbind "mousedrag.#{EVT_NS}"

    _addWindowEvents: ->
      console.log 'addWindowEvents'
      @dragStarted = false

      @_addMousemoveEvent()

      # bind mouseup to the window as it may occur outside of the image
      $(window).one "mouseup.#{EVT_NS}", (evt) =>
        @_logEvent 'window mouseup'
        if @dragStarted
          @$elem.trigger 'mousedragend', evt
          unless @isOverDropTarget
            @$elem.trigger 'mousedropcancel', evt
        @_removeWindowEvents()

    _addMousemoveEvent: ->
      # bind mousemove to the window as we can drag the image around
      # wherever we want, not just within the sidebar or viewport
      $(window).bind "mousemove.#{EVT_NS}", (evt) =>
        # @_logEvent $(window), 'window mousemove'
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

    _logEvent: (args...) ->
      [name, $elem] = args.reverse()
      desc = if @options.helper then 'map object' else 'helper'
      msg = "#{EVT_NS}: #{name}"
      msg += " (##{$elem.data('node-uid')})" if $elem
      console.log "#{msg} (#{desc})"

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
          method = args[0]
          if typeof dragObject[method] is 'function'
            console.log "calling #{method} on ##{$this.data('node-uid')}"
            dragObject[method](args[1..-1])
          if method is 'destroy'
            $this.data('dragObject', null)
  $.ender(enderMethods, true)

  return DragObject

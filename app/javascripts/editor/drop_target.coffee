
define 'editor.DropTarget', ->
  meta = require('meta')
  dnd = require('editor.dnd')

  EVT_NS = 'dnd.dropTarget'

  DropTarget = meta.def
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

      @$sensor
        .bind "dropopen.#{EVT_NS}", (evt) =>
          @_logEvent @$sensor, 'sensor dropopen'
          $dragOwner  = $(evt.relatedTarget)
          dragObject  = $dragOwner.data('dragObject')
          $draggee    = dragObject.getDraggee()
          $dragHelper = dragObject.getHelper()

          @$sensor
            .one "mouseup.#{EVT_NS}", (evt) =>
              @_logEvent @$sensor, 'elem mouseup'
              evt.relatedTarget = $draggee[0]
              evt.relatedObject = dragObject
              @$sensor.trigger "mousedropwithin", evt
              $dragOwner.trigger "mousedrop", evt

          if @_mouseWithinSensor(evt)
            dragObject.setInsideDropTarget()
            # if the element being dragged is already within the sensor then
            # there's no point in firing dragover/dragout etc.
            $(window).bind "mousemove.#{EVT_NS}", (evt) =>
              # @_logEvent 'elem mousemove'
              if @_mouseWithinSensor(evt)
                @$sensor.trigger "mousedragwithin", evt
            return

          lastMouseLocation = null
          mouseenterFired = false
          mouseleaveFired = false

          dragObject.setOutsideDropTarget()

          # you might think we can just bind mouseenter and mouseleave to
          # $sensor but mouseenter won't actually ever be fired since the
          # mouse is already on top of the drag helper when it is dragged
          # in/out of the viewport
          $(window).bind "mousemove.#{EVT_NS}", (evt) =>
            # @_logEvent 'elem mousemove'
            if @_mouseWithinSensor(evt)
              # console.log 'mouse within sensor'
              if lastMouseLocation is 'outside' and not mouseenterFired
                mouseenterFired = true
                $dragOwner.trigger "mousedropover", evt
                @$sensor.trigger "mousedragover", evt
              lastMouseLocation = 'inside'
              @$sensor.trigger "mousedragwithin", evt
            else
              if (
                lastMouseLocation is 'inside' and
                mouseenterFired and not mouseleaveFired
              )
                mouseleaveFired = true
                @$sensor.trigger "mousedragout", evt
                $dragOwner.trigger "mousedropout", evt
              lastMouseLocation = 'outside'

          # TODO: Need to make sure if this fires before $dragOwner
          # mousedropover or after
          @$sensor
            .bind "mousedragover.#{EVT_NS}", (evt) =>
              @_logEvent @$sensor, 'elem mousedragover'
              @$receptor.append($draggee)
              dragObject.setInsideDropTarget()
              # call this preemptively to prevent a jump when first dragging an
              # object into the viewport
              dragObject.position(evt)

            # TODO: Need to make sure if this fires before $dragOwner
            # mousedropout or after
            .one "mousedragout.#{EVT_NS}", (evt) =>
              @_logEvent @$sensor, 'elem mousedragout'
              dragObject.setOutsideDropTarget()
              $draggee.detach()

            .one "dropclose.#{EVT_NS}", (evt) =>
              @_logEvent @$sensor, 'sensor dropclose'
              $(window).unbind "mousemove.#{EVT_NS}"
              @$sensor.unbind "mousedragover.#{EVT_NS}"

    destroy: ->
      @$sensor.unbind(".#{EVT_NS}")
      $(window).unbind(".#{EVT_NS}")

    getSensor: -> @$sensor

    getReceptor: -> @$receptor

    _mouseWithinSensor: (evt) ->
      (@x1 <= evt.pageX <= @x2 and @y1 <= evt.pageY <= @y2)

    _logEvent: (args...) ->
      [name, $elem] = args.reverse()
      msg =  "#{EVT_NS}: #{name}"
      msg += " (##{$elem.data('node-uid')})" if $elem
      console.log(msg)

  enderMethods =
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
          if method is 'destroy'
            $this.data('dropTarget', null)
  $.ender(enderMethods, true)

  return DropTarget

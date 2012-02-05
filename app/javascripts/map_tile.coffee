define (require) ->
  MapTile = meta.def 'game.MapTile',
    assignable,
    simpleDrawable,

    # Initialize the MapTile.
    #
    # drawable - Either an Image or an ImageSequence.
    #
    init: (@drawable, @x, @y) ->

    assignTo: (map) ->
      @_super(map)
      @drawable.assignTo(this)

    # Have this
    draw: ->
      @drawable.draw(@x, @y)

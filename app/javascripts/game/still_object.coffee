(game = @game).define 'StillObject', (name) ->
  # A StillObject represents an object on the map that lives in the foreground
  # layer and is thus collidable. It is simple in that it does not contain any
  # states, and always uses the same image to draw itself.
  #
  StillObject = @meta.def name,
    @roles.assignable,
    @roles.Mappable,
    @roles.Collidable,
    @roles.drawable,  # implies tickable

    init: (imagePath, width, height) ->
      @_super(width, height)  # Mappable
      @image = game.imageCollection.get(imagePath)
      return this

    activate: ->

    deactivate: ->

    predraw: (ctx) ->
      @image.clear(ctx, @mbounds.x1, @mbounds.y1)

    draw: (ctx) ->
      @image.draw(ctx, @mbounds.x1, @mbounds.y1)

  return StillObject

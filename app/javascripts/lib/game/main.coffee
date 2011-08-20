game = window.game ||= {}
# {Keyboard, Viewport, Player} = game

# game.util.module "game.Main",
game.Main =
  init: ->
    @reset()

    #Keyboard.init()

    #@$container = $('<div />')
    #@viewport = Viewport.init()

    return this

  destroy: ->
    @removeEvents()
    Keyboard.destroy()
    @reset()
    @detach()
    return this

  reset: ->
    # ...
    return this

  addEvents: ->
    @viewport.addEvents()
    return this

  removeEvents: ->
    @viewport.removeEvents()
    return this

  attachTo: (wrapper) ->
    #$(wrapper).append(@$container)
    $(wrapper).text("It works!")
    return this

  detach: ->
    @$container.detach()
    return this

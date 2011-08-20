game = window.game || {}
# {Keyboard, Viewport, Player} = game

# game.util.module "game.Main",
game.Main =
  init: ->
    @reset()

    #Keyboard.init()

    #@$container = $('<div />')
    #@viewport = Viewport.init()

  destroy: ->
    @removeEvents()
    Keyboard.destroy()
    @reset()
    @detach()

  reset: ->
    # ...

  addEvents: ->
    @viewport.addEvents()

  removeEvents: ->
    @viewport.removeEvents()

  attachTo: (wrapper) ->
    #$(wrapper).append(@$container)
    $(wrapper).text("It works!")

  detach: ->
    @$container.detach()

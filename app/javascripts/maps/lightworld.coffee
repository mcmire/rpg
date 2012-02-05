########
# I'm trying to figure out if this class is valuable
########

define (require) ->
  {MapGroup, Foreground, Background} = require('app/maps')

  #--- REQUIRE MAP AREAS HERE --------------------------------------------------
  require('./lw_52')(areas)
  #-----------------------------------------------------------------------------

  map =
    areas: areas

    assignTo: (core) ->
      @core = core
      @viewport = @core.viewport

    destroy: ->
      @currentArea.destroy()

    load: ->
      @loadArea('lw_52')

    addPlayer: (player) ->
      @currentArea.addPlayer(player)

    tick: ->
      @currentArea.tick()

    #---

    # Public: Load an area on the current map, and slide the viewport
    # over (??).
    #
    # name - String name of a map, or a Map instance.
    #
    loadArea: (nameOrMap) ->
      if nameOrMap.isPrototypeOf(Map)
        @currentArea = nameOrMap
      else
        @currentArea = @areas.getMap(name)
      @currentArea.load()
      # TODO: all animation on current map needs to freeze and the new map needs
      # to slide into view
      @canvas.$element.css("background-image", @currentArea.url)

    # Public: Return the area on the map above the current one, if one exists.
    #
    getAreaUp: ->
      @currentArea.up

    # Public: Load the corresponding to the area above this one on the map,
    # along with its sprites.
    #
    loadAreaUp: ->
      # ...

    # Public: Return the area on the map below the current one, if one exists.
    #
    getAreaDown: ->
      @currentArea.down

    # Public: Load the corresponding to the area below this one on the map,
    # along with its sprites.
    #
    loadAreaDown: ->
      # ...

    # Public: Return the area on the map to the left of the current one, if one
    # exists.
    #
    getAreaLeft: ->
      @currentArea.left

    # Public: Load the corresponding to the area to the left of this one on the
    # map, along with its sprites.
    #
    loadAreaLeft: ->
      # ...

    # Public: Return the area on the map to the right of the current one, if one
    # exists.
    #
    getAreaRight: ->
      @currentArea.right

    # Public: Load the corresponding to the area to the right of this one on the
    # map, along with its sprites.
    #
    loadAreaRight: ->
      # ...


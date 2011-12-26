game = window.game
{EventHelpers} = game

keyboard = game.util.module 'game.keyboard', [EventHelpers]

keyboard.keys = keys =
  KEY_TAB: 9
  KEY_ESC: 27
  KEY_SHIFT: 16
  KEY_CTRL: 17
  KEY_ALT: 18
  KEY_META: 91
  KEY_UP: 38
  KEY_DOWN: 40
  KEY_LEFT: 37
  KEY_RIGHT: 39
  KEY_W: 87
  KEY_A: 65
  KEY_S: 83
  KEY_D: 68
  KEY_H: 72
  KEY_J: 74
  KEY_K: 75
  KEY_L: 76

keyboard.modifierKeys =
  keys.KEY_SHIFT
  keys.KEY_CTRL
  keys.KEY_ALT
  keys.KEY_META

keyboard.keyHandlers = {}

keyboard.init = ->
  unless @isInit
    @reset()
    @debugTimer = new Date()
    @isInit = true
  return this

keyboard.reset = ->
  @pressedKeys = {}
  # Clear the cached handlers to prevent stuck keys
  @activeKeyHandlers = {}
  return this

keyboard.destroy = ->
  if @isInit
    @reset()
    @removeEvents()
    @isInit = false
  return this

keyboard.addEvents = ->
  self = this

  @bindEvents document,
    keydown: (event) ->
      key = event.keyCode
      # Keep track of which keys are being held down at any given time
      self.pressedKeys[key] = 1
      # Cache handlers for keys which are currently being held down
      # so that it is faster when iterating through them
      if (handler = self.keyHandlers[key])
        self.activeKeyHandlers[key] ||= handler
        event.preventDefault()

    keyup: (event) ->
      key = event.keyCode
      delete self.pressedKeys[key]
      if key of self.activeKeyHandlers
        delete self.activeKeyHandlers[key]
        event.preventDefault()

  @bindEvents window,
    blur: (event) ->
      self.reset()

  return this

keyboard.removeEvents = ->
  @unbindEvents document, "keydown", "keyup"
  @unbindEvents window, "blur"
  return this

keyboard.runHandlers = ->
  #date = new Date()
  ## don't want to print debug info to the console *every* draw, just once per second
  #if (date - @debugTimer) >= 1000
  @globalKeyHandler?()
    #@debugTimer = date
  handler() for key, handler of @activeKeyHandlers

keyboard.addKeyHandler = (keyNames..., callback) ->
  keyNames = $.flatten(keyNames)
  if keyNames.length
    for keyName in keyNames
      @keyHandlers[@keys[keyName]] = callback
  else
    @globalKeyHandler = callback
keyboard.addKeyHandlers = keyboard.addKeyHandler

keyboard.addGlobalKeyHandler = (callback) ->
  @globalKeyHandler = callback

keyboard.removeKeyHandlers = (keyNames...) ->
  keyNames = $.flatten(keyNames)
  for keyName in keyNames
    delete @keyHandlers[@keys[keyName]]
keyboard.removeKeyHandlers = keyboard.removeKeyHandler

keyboard.removeGlobalKeyHandler = ->
  @globalKeyHandler = null

keyboard.isKeyPressed = (arg) ->
  if typeof arg is "string"
    keyCode = @keys[arg]
    throw new Error("'#{arg}' is not a valid key") unless keyCode
  else
    keyCode = arg

  @pressedKeys.hasOwnProperty(keyCode)

keyboard.modifierKeyPressed = (event) ->
  event.shiftKey or event.ctrlKey or event.altKey or event.metaKey

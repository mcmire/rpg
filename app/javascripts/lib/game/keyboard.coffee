game = window.game
{DOMEventHelpers} = game

game.util.module 'game.Keyboard', [DOMEventHelpers],
  keys:
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

  modifierKeys: [16, 17, 18, 91]

  keyHandlers: {},

  init: ->
    unless @isInit
      @reset()
      @debugTimer = new Date()
      @isInit = true
    return this

  reset: ->
    @pressedKeys = {}
    # Clear the cached handlers to prevent stuck keys
    @activeKeyHandlers = {}
    return this

  destroy: ->
    if @isInit
      @reset()
      @removeEvents()
      @isInit = false
    return this

  addEvents: ->
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

  removeEvents: ->
    @unbindEvents document, "keydown", "keyup"
    @unbindEvents window, "blur"
    return this

  runHandlers: ->
    date = new Date()
    # don't want to print debug info to the console *every* draw, just once per second
    if (date - @debugTimer) >= 1000
      @globalKeyHandler?()
      @debugTimer = date
    handler() for key, handler of @activeKeyHandlers

  addKeyHandler: (keyNames..., callback) ->
    if keyNames.length
      for keyName in keyNames
        @keyHandlers[@keys[keyName]] = callback
    else
      @globalKeyHandler = callback

  isKeyPressed: (arg) ->
    if typeof arg is "string"
      keyCode = @keys[arg]
      throw new Error("'#{arg}' is not a valid key") unless keyCode
    else
      keyCode = arg

    @pressedKeys.hasOwnProperty(keyCode)

  modifierKeyPressed: (event) ->
    event.shiftKey or event.ctrlKey or event.altKey or event.metaKey

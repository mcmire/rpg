$.export "SpriteEditor.Keyboard", (SpriteEditor) ->

  Keyboard = {}
  SpriteEditor.DOMEventHelpers.mixin(Keyboard, "SpriteEditor_Keyboard")

  # TODO: Make these key names the same as in the LWJGL library
  keys =
    TAB_KEY: 9
    ESC_KEY: 27
    SHIFT_KEY: 16
    CTRL_KEY: 17
    ALT_KEY: 18
    META_KEY: 91
    KEY_1: 49
    KEY_2: 50
    KEY_3: 51
    KEY_4: 52
    E_KEY: 69
    G_KEY: 71
    Q_KEY: 81
    S_KEY: 83
    X_KEY: 88
    Z_KEY: 90

  # This is only here for compatibility, remove when fixed
  $.extend Keyboard, keys

  $.extend Keyboard,
    keys: keys
    modifierKeys: [16, 17, 18, 91]

    init: ->
      unless @isInitialized
        @reset()
        @isInitialized = true
      return this

    reset: ->
      @pressedKeys = {}
      return this

    destroy: ->
      if @isInitialized
        @reset()
        @removeEvents()
        @isInitialized = false
      return this

    addEvents: ->
      self = this
      @_bindEvents document,
        keydown: (event) -> self.pressedKeys[event.keyCode] = 1
        keyup: (event) -> delete self.pressedKeys[event.keyCode]
      @_bindEvents window,
        blur: (event) -> self.reset()
      return this

    removeEvents: ->
      @_unbindEvents document, "keydown", "keyup"
      @_unbindEvents window, "blur"
      return this

    isKeyPressed: (key) ->
      if typeof key is "string"
        unless key = @keys[key]
          throw new Error("'#{key}' is not a valid key")
      @pressedKeys.hasOwnProperty(key)

    modifierKeyPressed: (event) ->
      (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey)

  return Keyboard

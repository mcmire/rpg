game = window.game

class SpriteSheet
  constructor: (@mob, path, @width, @height) ->
    @imagePath = "#{@mob.main.imagesPath}/#{path}"
    @image = new Image()
    @image.src = @imagePath
    @currentFrame = 0

    @sequences = {}

    @addEvents()

  addEvents: ->
    self = this
    @image.onload  = -> self.mob.isLoaded = true
    @image.onerror = -> throw "Image #{self.imagePath} failed to load!"

  addSequence: (name, skipFreq, frames, opts={}) ->
    opts.repeat ?= true
    @sequences[name] =
      new AnimationSequence(this, skipFreq, frames, opts.repeat, opts.then)

  useSequence: (name) ->
    if name isnt @currentSequence
      @currentSequence = name
      @sequences[@currentSequence].reset()

  draw: ->
    seq = @sequences[@currentSequence]
    seq.draw()
    @useSequence(seq.afterFinish) if seq.isFinished() and seq.afterFinish

class AnimationSequence
  constructor: (@spriteSheet, @skipFreq, @frames, @repeat, @afterFinish) ->
    @numFrames = @frames.length

  reset: ->
    @currentFrame = 0

  draw: ->
    {mob, image, width, height} = @spriteSheet

    ctx = mob.viewport.canvas.ctx
    x = mob.bounds.inViewport.x1
    y = mob.bounds.inViewport.y1

    ctx.save()

    frame = @frames[@currentFrame]
    throw 'frame is undefined' unless frame?
    yOffset = frame * height
    ctx.drawImage(image, 0, yOffset, width, height, x, y, width, height)

    # DEBUG
    # ctx.strokeStyle = '#00ff00'
    # ctx.strokeRect(x+0.5, y+0.5, width, height)

    ctx.restore()

    if (@spriteSheet.mob.main.numDraws % @skipFreq) is 0
      @currentFrame++
      @currentFrame %= @numFrames if @repeat

  isFinished: ->
    @currentFrame >= @numFrames

game.SpriteSheet = SpriteSheet

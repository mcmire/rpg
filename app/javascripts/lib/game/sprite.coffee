game = window.game

class game.SpriteSheet
  constructor: (path, width, height) ->
    @image = new Image()
    @image.src = path
    [@width, @height] = [width, height]

class game.SpriteAnimation
  constructor: (@spriteSheet, @frequency=0, @frames) ->
    @currentFrame = 0
    @totalFrames = @frames.length
    [@width, @height] = [@spriteSheet.width, @spriteSheet.height]

  step: (canvas, x, y)->
    c = canvas.ctx

    @currentFrame = ((@currentFrame + 1) % @totalFrames) if game.main.globalCounter % @frequency == 0
    yOffset = @frames[@currentFrame] * @height
    c.drawImage(@spriteSheet.image, 0, yOffset, @width, @height, x, y, @width, @height)

    # DEBUG
    c.strokeStyle = '#00ff00'
    c.strokeRect(x+0.5, y+0.5, @width, @height)

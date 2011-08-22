game = window.game
game.SpriteSheet = class SpriteSheet
  constructor: (path, width, height) ->
    @image = new Image()
    @image.src = path
    [@width, @height] = [width, height]

game.SpriteAnimation = class SpriteAnimation
  constructor: (@spriteSheet, @frequency=0, @frames) ->
    @currentFrame = 0
    @totalFrames = @frames.length
    [@width, @height] = [@spriteSheet.width, @spriteSheet.height]

  step: (x, y)->
    @currentFrame = ((@currentFrame + 1) % @totalFrames) if game.Main.globalCounter % @frequency == 0
    yOffset = @frames[@currentFrame] * @height
    game.Main.canvas.ctx.drawImage(@spriteSheet.image, 0, yOffset, @width, @height, x, y, @width, @height)

# game.Sprite = class Sprite
  # constructor: ()

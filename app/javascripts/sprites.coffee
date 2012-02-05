game = (window.game ||= {})

ImageSequence = game.ImageSequence
{images} = game.images

sprites = {}

add = (imagePath, width, height, frameIndices, opts={}) ->
  sprites[imagePath] = ImageSequence.create(images[imagePath], width, height, frameIndices, opts)

#---

add 'flower', 16, 16, [0, 1, 2], frameDuration: 4

#---

game.sprites = sprites

window.scriptLoaded('app/sprites')

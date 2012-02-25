game = (window.game ||= {})

ImageSequence = game.ImageSequence
imageCollection = game.imageCollection

sprites = {}

add = (imagePath, width, height, frameIndices, opts={}) ->
  sprites[imagePath] = ImageSequence.create(imageCollection.get(imagePath), width, height, frameIndices, opts)

#---

add 'flower', 16, 16, [2, 0, 1], frameDuration: 6, doesRepeat: true

#---

game.spriteCollection =
  get: (name) -> sprites[name]

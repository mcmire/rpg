game = (window.game ||= {})

ImageSequence = game.ImageSequence
imageCollection = game.imageCollection

sprites = {}

add = (imagePath, width, height, frameIndices, opts={}) ->
  sprites[imagePath] = ImageSequence.create(imageCollection.get(imagePath), width, height, frameIndices, opts)

#---

add 'flower', 16, 16, [0, 1, 2], frameDuration: 4

#---

game.spriteCollection =
  get: (name) -> sprites[name]

window.scriptLoaded('app/sprite_collection')

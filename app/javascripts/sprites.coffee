define (require) ->
  ImageSequence = require('app/image_sequence')

  (main) ->
    {images} = require('app/images')(main)

    sprites = {}

    add = (imagePath, width, height, frameIndices, opts={}) ->
      sprites[imagePath] = ImageSequence.create(images[imagePath], width, height, frameIndices, opts)

    #---

    add 'flower', 16, 16, [0, 1, 2], frameDuration: 4

    #---

    return sprites

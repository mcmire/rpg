game = (window.game ||= {})

mapCollection = game.mapCollection
imageCollection = game.imageCollection
spriteCollection = game.spriteCollection
Block = game.Block
# Guard = game.Guard

mapCollection.add 'lw_52', 1024, 1024, (fg, bg) ->
                       # (x1, y1), (width, height)
    bg.fill '#48a048', [0, 0], [1024, 1024]
    bg.fill '#3860b0', [944, 0], [80, 688]
    bg.fill '#3860b0', [832, 96], [112, 496]
    bg.add spriteCollection.get('flower'),
      [160, 608]
      [320, 320]
      [336, 336]
      [352, 160]
      [352, 320]
      [368, 176]
      [384, 32 ]
      [384, 128]
      [384, 160]
      [400, 144]
      [704, 320]
      [720, 336]
      [736, 288]
      [736, 320]
      [768, 512]
      [768, 512]
      [784, 528]
      [800, 512]
    bg.add imageCollection.get('links_house'), [288, 352]
    #bg.add sprites['waves'], [whatever, whatever], frameDelay: 2

    # fg.add Block,
    #   # x1, y1, width, height
    #   [96, 96, 352, 112]
    # TODO: Get this to work
    # fg.add Guard,
    #   [407, 944]
    #   [478, 944]
    #   [950, 752]
    #   [950, 816]

window.scriptLoaded('app/maps/lw_52')

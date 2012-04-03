(function() {

  define('game/maps/lw_52', function() {
    return function(map, img, spr) {
      return map('lw_52', 1024, 1024, function(fg, bg) {
        var eightStone;
        bg.fill('#48a048', [0, 0], [1024, 1024]);
        bg.fill('#3860b0', [944, 0], [80, 688]);
        bg.fill('#3860b0', [832, 96], [112, 496]);
        bg.add(spr('flower'), [160, 608], [320, 320], [336, 336], [352, 160], [352, 320], [368, 176], [384, 32], [384, 128], [384, 160], [400, 176], [400, 144], [480, 928], [704, 320], [720, 336], [736, 288], [736, 320], [768, 512], [784, 528], [800, 32], [800, 512]);
        bg.add(img('links_house'), [288, 352]);
        bg.add(img('links_door_closed'), [368, 512]);
        bg.add(img('entrance_skull'), [352, 560], [368, 544], [384, 560]);
        bg.add(img('grass1'), [0, 544], [32, 608], [128, 592], [160, 624], [224, 512], [256, 336], [256, 352], [256, 480], [272, 320], [272, 368], [288, 144], [288, 320], [304, 338], [320, 176], [320, 336], [352, 16], [352, 128], [352, 176], [352, 336], [368, 144], [384, 48], [384, 144], [384, 176], [448, 912], [480, 944], [512, 480], [704, 272], [704, 336], [704, 352], [704, 432], [720, 368], [736, 304], [736, 336], [736, 352], [736, 400], [752, 368], [768, 16], [768, 496], [768, 528], [768, 544], [768, 592], [784, 560], [800, 48], [800, 464], [800, 528], [800, 544], [800, 624], [816, 560]);
        bg.add(img('grass2'), [16, 544], [48, 608], [144, 592], [176, 624], [240, 512], [272, 336], [272, 352], [272, 480], [288, 336], [304, 144], [304, 320], [336, 176], [336, 320], [352, 144], [368, 128], [368, 160], [368, 336], [368, 16], [400, 48], [400, 128], [400, 160], [464, 912], [496, 944], [528, 480], [704, 368], [720, 272], [720, 320], [720, 352], [720, 432], [736, 368], [752, 304], [752, 336], [752, 352], [752, 400], [768, 560], [784, 16], [784, 496], [784, 512], [784, 544], [784, 592], [800, 560], [816, 48], [816, 464], [816, 528], [816, 544], [816, 624]);
        eightStone = require('game.StillObject').create('8stone', 32, 32);
        fg.add(require('game.Block').create(192, 176), [288, 352]);
        fg.add(eightStone, [256, 640]);
        return fg.onLoad(function() {
          return this.player.setMapPosition(368, 592);
        });
      });
    };
  });

}).call(this);

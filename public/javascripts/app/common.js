(function() {
  var common;

  common = (window.common || (window.common = {}));

  $.v.extend(common, {
    imagesPath: '/images',
    resolveImagePath: function(path) {
      return "" + this.imagesPath + "/" + path;
    }
  });

}).call(this);

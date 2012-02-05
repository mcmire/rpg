require 'sinatra'
require 'pp'

set :views, "app/views"

VENDOR_SCRIPTS = %w(
  vendor/ender
)
APP_SCRIPTS = %w(
  app/ender_ext
  app/util
  app/meta
  app/meta2
  app/roles
  app/keyboard
  app/ticker
  app/bounds
  app/viewport
  app/map_tile
  app/canvas
  app/image
  app/image_sequence
  app/maps
  app/core
  app/main
  app/images
  app/sprites
  app/maps/lw_52
  app/init
)
SCRIPTS = VENDOR_SCRIPTS + APP_SCRIPTS

helpers do
  def latest_script_mtime
    mtime = nil
    Dir[ File.expand_path('../public/javascripts/**/*.js', __FILE__) ].each do |fn|
      t = File.mtime(fn)
      mtime = t if !mtime or t > mtime
    end
    mtime.to_i
  end

  def scripts
    html = ""
    bust = latest_script_mtime
    html << %(
<script>
  window.scripts = #{JSON.generate(APP_SCRIPTS)};
  window.scriptsLoaded = [];
  window.scriptLoaded = function(name) {
    scriptsLoaded.push(name);
    var numScripts = window.scripts.length;
    var numScriptsLoaded = window.scriptsLoaded.length;
    console.log(name + " loaded (" + numScriptsLoaded + "/" + numScripts + ").");
  };
</script>
    )
    for path in SCRIPTS
      html << %(<script src="/javascripts/#{path}.js?#{bust}"></script>\n)
    end
    html
  end
end

get "/?" do
  erb :index
end

get "/keyboard_test/?" do
  erb :keyboard_test
end

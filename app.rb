require 'sinatra'
require 'pp'

set :views, "app/views"

def parse_scripts(text)
  scripts = text.split(/\n/)
  scripts.each {|s| s.gsub!(/#(.+)$/, ""); s.strip! }
  scripts.reject! {|s| s =~ /^#/ or s.empty? }
  scripts
end

VENDOR_SCRIPTS = parse_scripts <<EOT
  vendor/ender
EOT

APP_SCRIPTS = parse_scripts <<EOT
app/ender_ext
app/ext
app/util
app/meta
app/meta2
app/roles

# things that don't have an immediate dependency
app/bounds
app/canvas
app/collidable
app/collidable_collection
app/image_sequence
app/keyboard
app/main
app/mappable
app/viewport

app/ticker
app/core

app/block
app/still_object
app/live_object

app/image  # image must be defined after main
app/image_collection
app/sprite_collection
app/map_collection
app/background
app/foreground
app/map
app/map_tile
app/maps/lw_52

app/player

app/init
EOT
SCRIPTS = VENDOR_SCRIPTS + APP_SCRIPTS

helpers do
  def scripts
    html = ""
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
      fn = File.expand_path("../public/javascripts/#{path}.js", __FILE__)
      t = File.mtime(fn)
      bust = t.to_i
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

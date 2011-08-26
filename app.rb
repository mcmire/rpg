require 'sinatra'
require 'pp'

set :views, "app/views"

helpers do
  def scripts
    path = "/javascripts"
    dir = File.expand_path("../public/javascripts", __FILE__)
    scripts = %w(
      vendor/ender.js
      vendor/bowser.js
      vendor/request_anim_shims.js
      lib/ender_ext.js
      lib/game/util.js
      lib/game/dom_event_helpers.js
      lib/game/keyboard.js
      lib/game/canvas.js
      lib/game/bounds.js
      lib/game/viewport.js
      lib/game/collision_layer.js
      lib/game/player.js
      lib/game/sprite.js
      lib/game/main.js
    )
    html = ""
    scripts.each do |script|
      next if script =~ /^#/
      mtime = File.mtime("#{dir}/#{script}")
      html << %{<script src="/javascripts/#{script}?#{mtime.to_i}"></script>\n}
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

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
      app/ender_ext.js
      app/metaobj.js
      app/roles.js
      app/plug.js
      app/canvas.js
      app/keyboard.js
      app/bounds.js
      app/grob.js
      app/collision_layer.js
      app/ticker.js
      app/fps_reporter.js
      app/player_debugger.js
      app/viewport.js
      app/mob.js
      app/player.js
      app/enemy.js
      app/core.js
      app/main.js
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

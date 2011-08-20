require 'sinatra'
require 'pp'

set :views, "app/views"

helpers do
  def scripts
    scripts = %w(
      vendor/ender.js
      vendor/bowser.js
      lib/ender_ext.js
      #lib/game/util.js
      lib/game/main.js
    )
    html = ""
    scripts.each do |script|
      next if script =~ /^#/
      html << %{<script src="#{script}"></script>}
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

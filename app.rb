require 'sinatra'
require 'pp'

set :views, "app/views"

helpers do
  def latest_script_mtime
    mtime = nil
    Dir[ File.expand_path('../public/javascripts/**/*.js', __FILE__) ].each do |fn|
      t = File.mtime(fn)
      mtime = t if !mtime or t > mtime
    end
    mtime.to_i
  end
end

get "/?" do
  erb :index
end

get "/keyboard_test/?" do
  erb :keyboard_test
end

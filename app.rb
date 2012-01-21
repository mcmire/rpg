require 'sinatra'
require 'pp'

set :views, "app/views"

helpers do
end

get "/?" do
  erb :index
end

get "/keyboard_test/?" do
  erb :keyboard_test
end

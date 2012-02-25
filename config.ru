
require File.expand_path('../config/boot', __FILE__)
require "#{APP_ROOT}/app"

run Sinatra::Application

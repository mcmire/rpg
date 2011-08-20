root = File.expand_path("..", __FILE__)

require 'rubygems'

require 'bundler'
Bundler.setup(:default, ENV["RACK_ENV"])
Bundler.require

require "#{root}/app"

run Sinatra::Application

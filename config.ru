require 'rubygems'

require 'bundler'
Bundler.setup(:default, ENV["RACK_ENV"])
Bundler.require

root = File.expand_path("..", __FILE__)

require "#{root}/app"

require 'sass/plugin/rack'
Sass::Plugin.options.merge!(
  :template_location => "#{root}/app/stylesheets",
  :css_location => "#{root}/tmp/stylesheets"
)
use Sass::Plugin::Rack
use Rack::Static,
  :urls => %w(/stylesheets),
  :root => "#{root}/tmp"

Barista.configure do |c|
  c.env = ENV["RACK_ENV"] || "development"
  c.root = "#{c.app_root}/app/javascripts"
  c.output_root = "#{c.app_root}/tmp/javascripts"
end
use Barista::Filter if Barista.add_filter?
use Barista::Server::Proxy
Barista.setup_defaults

run Sinatra::Application

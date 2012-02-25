
APP_ROOT = File.expand_path('../..', __FILE__)
APP_ENV  = ENV['RACK_ENV'] || 'development'

require 'rubygems'

# Set some constants so Jammit (and jammit-sinatra) don't get confused
ASSET_ROOT  = APP_ROOT
PUBLIC_ROOT = DEFAULT_PUBLIC_ROOT = File.join(APP_ROOT, 'public')
JAMMIT_ENV  = APP_ENV

# require 'bundler'
# Bundler.setup(:default, APP_ENV.to_sym)

require 'pp'

require 'jammit'
Jammit.load_configuration File.join(APP_ROOT, 'config/assets.yml')

require 'colored'
require 'compass'
require 'compass/exec'

root = File.expand_path("..", __FILE__)

# Sass
guard 'shell' do
  watch %r{app/stylesheets/.*\.scss} do |m|
    puts "Compiling all stylesheets..."
    updater = Compass::Commands::UpdateProject.new(root, :quiet => false, :force => true)
    updater.perform
    puts "Stylesheets compiled successfully.".green if updater.successful?
  end
end

# CoffeeScript
guard 'coffeescript', :input => 'app/javascripts', :output => 'public/javascripts'

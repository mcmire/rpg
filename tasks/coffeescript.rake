namespace :coffeescript do
  desc "Compile all CoffeeScript files"
  task :compile => 'guard:init' do
    puts "Compiling CoffeeScript files..."
    guard = Guard.guards.find {|guard| Guard::CoffeeScript === guard }
    guard.run_all
  end
end

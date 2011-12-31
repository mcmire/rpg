namespace :sass do
  desc "Compile all Sass files"
  task :compile => 'guard:init' do
    puts "Compiling Sass files..."
    guard = Guard.guards.find {|guard| Guard::Sass === guard }
    guard.run_all
  end
end

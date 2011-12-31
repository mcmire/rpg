namespace :sass do
  desc "Compile all Sass files"
  task :compile => 'guard:init' do
    FileUtils.rm_rf root('public/stylesheets'), :verbose => true

    puts "Compiling Sass files..."
    guard = Guard.guards.find {|guard| Guard::Sass === guard }
    guard.run_all

    system('git add -f public/stylesheets')
  end
end

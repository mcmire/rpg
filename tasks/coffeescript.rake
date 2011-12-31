namespace :coffeescript do
  desc "Compile all CoffeeScript files"
  task :compile => [:init, 'guard:init'] do
    FileUtils.rm_rf root('public/javascripts'), :verbose => true

    puts "Compiling CoffeeScript files..."
    guard = Guard.guards.find {|guard| Guard::CoffeeScript === guard }
    guard.run_all

    FileUtils.mkdir_p root('public/javascripts/app'), :verbose => true
    Dir[ root('app/javascripts/**/*.js') ].each do |source|
      dest = source.sub('app/javascripts', 'public/javascripts/app')
      FileUtils.copy_file source, dest, :verbose => true
    end
    FileUtils.mkdir_p root('public/javascripts/vendor'), :verbose => true
    Dir[ root('vendor/javascripts/**/*.js') ].each do |source|
      dest = source.sub('vendor/javascripts', 'public/javascripts/vendor')
      FileUtils.copy_file source, dest, :verbose => true
    end

    system('git add -f public/javascripts')
  end
end

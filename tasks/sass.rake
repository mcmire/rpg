namespace :sass do
  desc "Compile all Sass files"
  task :compile => [:init, 'guard:init'] do
    FileUtils.rm_rf root('public/stylesheets'), :verbose => true

    puts "Compiling Sass files..."
    Guard.guards.each do |guard|
      next unless Guard::Sass === guard
      guard.run_all
    end

    system('git add -f public/stylesheets')
  end
end

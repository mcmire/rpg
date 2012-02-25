namespace :assets do
  desc "Rebuilds public/javascripts and public/stylesheets from the files in app/ and vendor/"
  task :build => [:init, 'coffeescript:compile', 'sass:compile']

  desc "Rebuilds assets and then compresses them"
  task :package => [:build, 'jammit:package']
end

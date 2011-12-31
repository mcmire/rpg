namespace :assets do
  desc "Rebuilds public/javascripts and public/stylesheets from the files in app/ and vendor/"
  task :rebuild => :init do
    Rake::Task['coffeescript:compile'].invoke
    Rake::Task['sass:compile'].invoke
  end
end

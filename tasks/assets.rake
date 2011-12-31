namespace :assets do
  desc "Rebuilds public/javascripts and public/stylesheets from the files in app/ and vendor/"
  task :rebuild => :init do
    FileUtils.rm_rf root('public/javascripts'), :verbose => true
    FileUtils.rm_rf root('public/stylesheets'), :verbose => true
    FileUtils.mkdir_p root('public/javascripts'), :verbose => true
    FileUtils.mkdir_p root('public/stylesheets'), :verbose => true
    FileUtils.ln_s root('vendor/javascripts'), root('public/javascripts/vendor'), :verbose => true
    FileUtils.ln_s root('vendor/stylesheets'), root('public/stylesheets/vendor'), :verbose => true
    Rake::Task['coffeescript:compile'].invoke
    Rake::Task['sass:compile'].invoke
    system('git add -f public/javascripts public/stylesheets')
  end
end

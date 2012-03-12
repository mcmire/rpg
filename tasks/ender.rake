
namespace :ender do
  task :copy => :init do
    FileUtils.cp root('build/ender.js'), root('public/javascripts/vendor/ender.js')
    FileUtils.cp root('build/ender.js'), root('vendor/javascripts/ender.js')
    system('git add -f public/javascripts/vendor/ender.js')
    system('git add -f vendor/javascripts/ender.js')
  end
end

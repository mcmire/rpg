
namespace :ender do
  task :refresh => :init do
    Dir.chdir(root) do
      system 'cd build && ender refresh'
    end
    Rake::Task['ender:copy'].invoke
  end

  task :copy => :init do
    Dir.chdir(root) do
      FileUtils.cp 'build/ender.js', 'public/javascripts/vendor/ender.js'
      FileUtils.cp 'build/ender.js', 'vendor/javascripts/ender.js'
      system 'git add -f public/javascripts/vendor/ender.js'
      system 'git add -f vendor/javascripts/ender.js'
    end
  end
end

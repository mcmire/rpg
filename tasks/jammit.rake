namespace :jammit do
  desc "Package all assets"
  task :package => :init do
    require 'jammit'
    puts "Packaging assets..."
    Jammit.package!
  end
end

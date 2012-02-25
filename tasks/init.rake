module RakeMixins
  def root(*paths)
    @_root_dir ||= File.expand_path('../..', __FILE__)
    ([@_root_dir] + paths).join("/")
  end
end

task :init do
  require File.expand_path('../../config/boot', __FILE__)
  include RakeMixins
end

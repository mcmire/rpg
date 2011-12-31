main = self

module RakeMixins
  def root(*paths)
    @_root_dir ||= File.expand_path('../..', __FILE__)
    ([@_root_dir] + paths).join("/")
  end
end

task :init do
  # Rake::DSL.__send__(:include, RakeMixins)
  include RakeMixins
end

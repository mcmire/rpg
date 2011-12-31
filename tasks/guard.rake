namespace :guard do
  task :init do
    require 'guard'
    Guard.setup
    Guard::Dsl.evaluate_guardfile
  end
end

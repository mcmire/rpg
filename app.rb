
require 'sinatra'
require 'jammit/sinatra'
require 'yajl/json_gem'

Sinatra.register(Jammit)

set :views, "app/views"

FILE_MTIMES = {}

helpers do
  def stylesheet_link_tag(path, options={})
    fn = _resolve_path(path, 'stylesheets')
    bust = _get_bust(fn)
    %(<link rel="stylesheet" href="#{path}?#{bust}">\n)
  end

  def javascript_include_tag(path, options={})
    fn = _resolve_path(path, 'javascripts')
    bust = _get_bust(fn)
    %(<script src="#{path}?#{bust}"></script>\n)
  end

  def scripts(group)
    html = ""
    script_paths =
      if APP_ENV == 'development'
        Jammit.packager.individual_urls(group.to_sym, :js)
      else
        Jammit.asset_url(group.to_sym, :css)
      end
    html << javascript_include_tag('/javascripts/vendor/ender.js')
    html << %!<script>window.SCRIPTS = #{JSON.generate(script_paths)}</script>!
    html << javascript_include_tag('/javascripts/app/game.js')
    return html
  end

  def styles(group)
    include_stylesheets(group)
  end

  def _resolve_path(path, type)
    fn = path.dup
    ext = (type == 'javascripts') ? '.js' : '.css'
    fn << ext unless fn.end_with?(ext)
    File.expand_path("../public/#{fn}", __FILE__)
  end

  def _get_bust(fn)
    t = FILE_MTIMES[fn] ||= File.mtime(fn)
    return t.to_i
  end
end

get "/?" do
  erb :game
end

get "/keyboard_test/?" do
  erb :keyboard_test
end

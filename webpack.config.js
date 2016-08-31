var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var postcssImport = require('postcss-import')
var postcssNested = require('postcss-nested')
var postcssCustomProperties = require('postcss-custom-properties')
var postcssCustomMedia = require('postcss-custom-media')
var postcssCalc = require('postcss-calc')
var postcssUrl = require('postcss-url')
var autoprefixer = require('autoprefixer')
var cssnano = require('cssnano')

/* Not needed for now.
var ExtractHTML = new ExtractTextPlugin('[name].html', {
  allChunks: true
})
*/
var ExtractCSS = new ExtractTextPlugin('[name].css', {
  allChunks: true
})

module.exports = function makeWebpackConfig () {

  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  var config = {}

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   */
  config.entry = {
    "slab-massive": './src/index.js'
  }

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   */
  config.output = {
    path: __dirname + '/dist',
    filename: '[name].js'
  }

  config.resolve = {
    modulesDirectories: ['src', 'node_modules']
  }

  config.externals = {
    'webcomponents.js': 'WebComponents',
    'hammerjs': 'Hammer'
  }

  config.module = {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /fonts\/.*\.(eot|svg|ttf|woff)$/,
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.(png|gif|jpg)$/,
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'css-to-string-loader!css-loader!postcss-loader',
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        loader: 'file-loader?name=[name].[ext]!svgo-loader',
        exclude: /(node_modules|fonts)/
      },
      {
        test: /\.html$/,
        loader: 'raw'
      },
    ]
  }

  config.plugins = [
    // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
    // Only emit files when there are no errors
    new webpack.NoErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    ExtractCSS,
    // ExtractHTML
  ]

  config.postcss = function (webpack) {
    var use = [
      postcssImport({
        addDependencyTo: webpack
      }),
      postcssNested,
      postcssCustomProperties,
      postcssCustomMedia,
      postcssCalc,
      autoprefixer,
      postcssUrl
    ]
    if (this.minimize) {
      use.push(cssnano({
        safe: true
      }))
    }
    return use
  }

  return config
}()

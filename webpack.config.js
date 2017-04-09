// webpack 2 docs https://gist.github.com/sokra/27b24881210b56bbaff7
var webpack = require('webpack')
var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var postcssImport = require('postcss-import')
var postcssCustomProperties = require('postcss-custom-properties')
var postcssCustomMedia = require('postcss-custom-media')
var postcssCalc = require('postcss-calc')
var postcssUrl = require('postcss-url')
var autoprefixer = require('autoprefixer')
var cssnano = require('cssnano')
var postcssConfig = require('./postcss.config.js')

var libraryName = 'slab-massive'

/* Not needed for now.
var ExtractHTML = new ExtractTextPlugin('[name].html', {
  allChunks: true
})
*/
var extractCSS = new ExtractTextPlugin({
  filename: '[name].css',
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
  config.entry = './index.js'

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   */
  config.output = {
    path: path.resolve(__dirname, './dist'),
    filename: libraryName + '.js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    pathinfo: false
  }

  config.resolve = {
    modules: [path.resolve(__dirname, './src'), 'node_modules']
  }

  // Polyfills and such
  config.externals = {
    'webcomponents.js': 'WebComponents'
  }

  config.module = {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|gif|jpg)$/,
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: extractCSS.extract([
          'css-to-string-loader',
          'css-loader',
          'postcss-loader'
        ]),
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        loader: 'file-loader?name=[name].[ext]!svgo-loader',
        exclude: /(node_modules)/
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      }
    ]
  }

  config.plugins = [
    // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
    // Only emit files when there are no errors
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: false,
      mangle: false,
      exclude: /\.js$/
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    new webpack.LoaderOptionsPlugin({
      test: /\.xxx$/, // may apply this only for some modules
      options: {
        postcss: function (webpack) {
          var use = [
            postcssImport({
              addDependencyTo: webpack
            }),
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
      }
    }),

    extractCSS
    // ExtractHTML
  ]

  return config
}()

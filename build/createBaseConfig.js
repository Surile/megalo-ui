const createMegaloTarget = require('@megalo/target')
const compiler = require('@megalo/template-compiler')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {
  pagesEntry,
  getSubPackagesRoot
} = require('@megalo/entry')
const _ = require('./util');
const webpack = require('webpack');
const path = require('path');
const appMainFile = _.resolve('src/app.js')
const CSS_EXT = {
  wechat: 'wxss',
  alipay: 'acss',
  swan: 'css',
};

function createBaseConfig(platform = 'wechat') {
  const cssExt = CSS_EXT[platform]

  return {
    mode: 'development',

    target: createMegaloTarget({
      compiler: Object.assign(compiler, {}),
      platform,
      htmlParse: {
        templateName: 'octoParse',
        src: _.resolve(`./node_modules/octoparse/lib/platform/${platform}`)
      },
    }),

    entry: {
      'app': appMainFile,
      ...pagesEntry(appMainFile)
    },

    output: {
      path: _.resolve(`dist-${platform}/`),
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[id].js'
    },

    devServer: {
      // hot: true,
    },

    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]|megalo[\\/]/,
            name: 'vendor',
            chunks: 'all'
          }
        }
      },
      runtimeChunk: {
        name: 'runtime'
      }
    },

    // devtool: 'cheap-source-map',
    devtool: false,

    resolve: {
      extensions: ['.vue', '.js', '.json'],
      alias: {
        // 'vue': _.resolve('../../megalo-workspace/megalo/dist/megalo.mp.esm'),
        'vue': 'megalo',
        '@': _.resolve('src')
      },
    },

    module: {
      rules: [
        // ... other rules
        {
          test: /\.vue$/,
          use: [{
            loader: 'vue-loader',
            options: {}
          }]
        },

        {
          test: /\.js$/,
          use: 'babel-loader',
        },

        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },

        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'px2rpx-loader',
              options: {
                rpxUnit: 1,
                rpxPrecision: 6
              }
            },
            'sass-loader'
          ]
        }
      ]
    },

    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: `./static/css/[name].${cssExt}`,
      }),
      new CopyWebpackPlugin([{
        context: `src/native/${platform}/`,
        from: `**/*`,
        to: _.resolve(`dist-${platform}/native`)
      }], {}),
      new webpack.ProvidePlugin({
        'Megalo': [path.resolve(`./node_modules/@megalo/api/platforms/${platform}`), 'default']
      })
    ]
  }
}

module.exports = createBaseConfig
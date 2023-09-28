//@ts-nocheck
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { merge } = require('webpack-merge')
const base = require('./webpack.config.base')
const pkgName = 'micro-message'
const config = {
  mode: 'production',

  output: {
    filename: '[name].min.js',
  },
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
    concatenateModules: true,
    minimize: true,
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /.*/,
          name: pkgName,
          chunks: 'all'
        }
      }
    },
    removeEmptyChunks: true
  }
}

module.exports = merge(base, config)

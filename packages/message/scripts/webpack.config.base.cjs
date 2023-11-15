//@ts-nocheck
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const isProd = process.env.NODE_ENV === 'production';

function rewritePkgFile(devOps) {
  const fs = require('fs-extra')
  const pkgJson = fs.readJsonSync('./package.json');
  for (const [key, value] of Object.entries(devOps)) {
    pkgJson[key] =
      process.env.NODE_ENV === 'development'
        ? value[0]
        : value[1]
  }
  fs.writeJsonSync('./package.json', pkgJson, { spaces: 2 })
}
// rewritePkgFile({
//   main: ['src/index.ts', 'dist/MicroMessage.min.js']
// })

const config = {
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.ts$/,
        loader: process.env.WEBPACK4
          ? require.resolve('ts-loader')
          : require.resolve('ts-loader-v9'),
        options: {
          transpileOnly: true,
          appendTsSuffixTo: [/\.vue$/],
        }
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false
            }
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env']
              }
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // reactivityTransform: true,
        },
      },
    ]
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
      stream: false,
      constants: false
    },
    extensions: ['.ts', '.js', '.css', '.vue']
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new VueLoaderPlugin(),
    // new CleanWebpackPlugin(),
    new NodePolyfillPlugin()
  ],
}


module.exports = config

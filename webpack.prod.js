const webpack = require('webpack');
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const devMode = process.env.NODE_ENV !== 'production'

const root = path.resolve(__dirname);
const dist = path.join(root, "public");

module.exports = {
  node: { fs: 'empty' },
  entry: {
    'babel-polyfill': ['babel-polyfill'],
    app: path.join(root, "src", "main.js")
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          ExtractCssChunks.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      }
    ]
  },
  output: {
    path: dist,
    filename: "[name].js"
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new HtmlWebPackPlugin({
      template: path.join(root, "src", "index.html"),
      filename: path.join(dist, "index.html")
    }),
    new ExtractCssChunks(
      {
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "[name].css",
        chunkFilename: "[id].css"
      }
    ),
    new Dotenv()
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin()
    ]
  }
};
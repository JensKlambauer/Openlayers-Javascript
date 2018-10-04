const webpack = require('webpack');
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const Dotenv = require('dotenv-webpack');

// const devMode = process.env.NODE_ENV !== 'production'

const root = path.resolve(__dirname);
const dist = path.join(root, "dist");

module.exports = {
  node: { fs: 'empty' },
  entry: { app: path.join(root, "src", "main.js") },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          // options: {
          //   presets: ["env"]
          // }
        }
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
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
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },
  output: {
    path: dist,
    filename: "[name].js",
    // library: 'karte',
    // libraryTarget: 'var',
    // libraryExport: 'default'
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebPackPlugin({
      favicon: 'assets/images/favicon.ico',
      template: path.join(root, "src", "index.html"),
      filename: path.join(dist, "index.html")
    }),   
    new Dotenv({
      path: path.join(__dirname, '.env'),
      systemvars: true
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
    // compress: true,
    port: 8099,
    // inline: true,
    // hot: true
  },
};
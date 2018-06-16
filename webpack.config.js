const webpack = require('webpack');
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

const root = path.resolve(__dirname);
const dist = path.join(root, "dist");

module.exports = {  
  entry: { app: path.join(root, "src", "main.js")},  
  devtool: 'inline-source-map',
  // devtool: "source-map",
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
          {loader: 'style-loader'},
          {loader: 'css-loader'}
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
    filename: "[name].js",
    // library: 'karte',
    // libraryTarget: 'var',
    // libraryExport: 'default'
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebPackPlugin({
      template: path.join(root, "src", "index.html"),
      filename: path.join(dist, "index.html")
    }),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8099,
    hot: true
  },
};
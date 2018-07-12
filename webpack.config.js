const webpack = require('webpack');
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");

const devMode = process.env.NODE_ENV !== 'production'

const root = path.resolve(__dirname);
const dist = path.join(root, "dist");

module.exports = {
  entry: { app: path.join(root, "src", "main.js") },
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
          ExtractCssChunks.loader,
          "css-loader"
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
    new ExtractCssChunks(
      {
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "[name].css",
        chunkFilename: "[id].css",
        hot: true // optional is the plguin cannot automatically detect if you are using HOT, not for production use
      }
    ),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // compress: true,
    port: 8099,
    inline: true,
    hot: true
  },
};
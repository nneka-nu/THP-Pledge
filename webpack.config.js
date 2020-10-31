require('dotenv').config();

// Dynamic Script and Style Tags
const HTMLPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Makes a separate CSS bundle
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const plugins = [
  new HTMLPlugin({
    template: `${__dirname}/src/index.html`,
  }),
  new MiniCssExtractPlugin({ filename: 'bundle.[hash].css' }),
  new CopyWebpackPlugin([
    {
      flatten: true,
      from: 'src/assets/downloads/*',
      to: 'downloads',
    },
    {
      from: 'src/CNAME',
    },
    {
      flatten: true,
      from: 'src/assets/images',
      to: 'images',
    },
    {
      flatten: true,
      from: 'data',
      to: 'data',
    },
  ]),
];

module.exports = {

  plugins,

  // Load this and everythning it cares about
  entry: `${__dirname}/src/main.js`,

  devtool: 'source-map',

  // Stick it into the "path" folder with that file name
  output: {
    filename: 'bundle.[hash].js',
    path: `${__dirname}/build`,
  },

  module: {
    rules: [
      // If it's a .js file not in node_modules, use the babel-loader
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      // If it's a .scss file
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [`${__dirname}/src/style`],
              sourceMap: true,
            },
          },
        ],

      },
      {
        test: /\.(woff|woff2|ttf|eot|glyph|\.svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'font/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|gif|png|tiff|svg)$/,
        exclude: /\.glyph.svg/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 6000,
              name: 'images/[name].[ext]',
            },
          },
        ],
      },

    ],
  },
  devServer: {
    historyApiFallback: true,
  },

};

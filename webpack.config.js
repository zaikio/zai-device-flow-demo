const path = require('path');
const Dotenv = require('dotenv-webpack');

let config = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/assets'),
  },

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/assets/',
    open: true,
    historyApiFallback: true
  }
};

if (process.env.NODE_ENV === 'development') {
  config.plugins = [new Dotenv()]
}

module.exports = config;

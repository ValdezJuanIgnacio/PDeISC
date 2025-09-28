const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);
const { name: appName } = require('./app.json');

// Módulos que Webpack necesita para resolver los archivos de React Native
const modules = [
  path.resolve(appDirectory, 'node_modules'),
  'node_modules',
];

module.exports = {
  // Punto de entrada de la aplicación
  entry: path.resolve(appDirectory, 'index.js'),
  mode: 'development',
  // Salida del archivo compilado
  output: {
    filename: 'bundle.js',
    path: path.resolve(appDirectory, 'dist'),
  },

  module: {
    rules: [
      {
        // Regla para archivos .js, .jsx, .ts, .tsx
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
      {
        // Regla para archivos de imagen
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  // Plugins para el empaquetado
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Ruta al archivo HTML
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),
  ],
  // Opciones del servidor de desarrollo
  devServer: {
    port: 8080,
    historyApiFallback: true,
  },
  // Resolver las extensiones y alias de los módulos
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web',
    },
    modules,
  },
};
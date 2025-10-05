// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NOTA: 'react-native-reanimated/plugin' debe ser el último plugin en la lista.
      'react-native-reanimated/plugin',
    ],
  };
};
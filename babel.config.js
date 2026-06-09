module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // react-native-reanimated v4 worklets plugin — MUST be the last plugin.
    plugins: ['react-native-worklets/plugin'],
  };
};

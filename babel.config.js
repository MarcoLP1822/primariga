module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Disabilita reanimated temporaneamente
          reanimated: false,
        },
      ],
    ],
    plugins: [],
  };
};

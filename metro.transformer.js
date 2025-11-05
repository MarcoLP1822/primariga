/* eslint-disable @typescript-eslint/no-var-requires */
const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async ({ src, filename, options }) => {
  // Transform import.meta to a compatible object for web
  if (options.platform === 'web') {
    src = src.replace(
      /import\.meta\.url/g,
      'typeof document !== "undefined" ? document.currentScript?.src || "" : ""'
    );
    src = src.replace(
      /import\.meta\.env/g,
      'typeof process !== "undefined" ? process.env : {}'
    );
    src = src.replace(
      /import\.meta/g,
      '({ url: typeof document !== "undefined" ? document.currentScript?.src || "" : "", env: typeof process !== "undefined" ? process.env : {} })'
    );
  }

  return upstreamTransformer.transform({ src, filename, options });
};

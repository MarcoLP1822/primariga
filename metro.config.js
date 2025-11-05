// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround per import.meta in web
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Resolve aliases for problematic packages on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Exclude react-native-worklets-core on web (uses import.meta)
  if (platform === 'web' && moduleName === 'react-native-worklets-core') {
    return {
      type: 'empty',
    };
  }
  
  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

// Transform all node_modules to handle import.meta
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  babelTransformerPath: require.resolve('./metro.transformer.js'),
};

// Ensure proper resolution for ESM packages
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

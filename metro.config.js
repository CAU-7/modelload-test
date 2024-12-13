const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// 기존 설정에서 assetExts를 확장
defaultConfig.resolver.assetExts.push('tflite');

const config = {
  resolver: {
    assetExts: defaultConfig.resolver.assetExts,
  },
};

module.exports = mergeConfig(defaultConfig, config);

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // 반드시 plugins 배열의 마지막에 위치해야 함
  ],
};

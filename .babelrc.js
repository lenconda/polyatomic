module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['transform-regenerator']
      }
    ]
  ],
  plugins: [
    ['@babel/transform-runtime']
  ],
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
  ],
  plugins: [
    [
      'prismjs',
      {
        languages: ['javascript', 'css', 'markup', 'c', 'cpp', 'clike', 'python', 'typescript'],
        plugins: ['line-numbers'],
        theme: 'twilight',
        css: true,
      },
    ],
  ],
};

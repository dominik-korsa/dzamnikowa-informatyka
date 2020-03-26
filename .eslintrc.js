module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    'vuetify',
  ],
  plugins: [
    'vuetify',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    semi: ['error', 'always'],
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      alphabetize: { order: 'asc' },
    }],
    'import/prefer-default-export': 'off',
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  ignorePatterns: [
    'functions'
  ],
};

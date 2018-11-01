module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': ['error', 'windows'],
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'class-methods-use-this': ['off', { exceptMethods: [] }],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    indent: ['error', 2],
    'comma-dangle': ['error', 'always'],
  },
};

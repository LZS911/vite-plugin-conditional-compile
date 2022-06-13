module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['google'],
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {
    'object-curly-spacing': 0,
    'no-unused-vars': 1,
    'quote-props': 0,
    indent: ['error', 2],
    'no-undef': 2,
    'max-len': 0,
    'require-jsdoc': 0,
    'prefer-promise-reject-errors': 0,
    'operator-linebreak': 0,
  },
};

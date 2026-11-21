const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: {
      camelcase: 'error',
      'max-lines-per-function': ['warn', { max: 25, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 3],
      'max-depth': ['error', 2],
    },
  },
  {
    // o middleware de erros do Express exige 4 parâmetros (erro, req, res, next)
    files: ['src/middlewares/**/*.js'],
    rules: {
      'max-params': ['error', 4],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
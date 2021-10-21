module.exports = {
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 9,
  },
  env: {
    browser: false,
    mocha: true,
    node: true,
    es6: true,
  },
  overrides: [
    {
      files: [
        '**/test/**/*.js',
        '**/test/**/*.mjs',
      ],
      rules: {
        'no-console': 'off',
        'no-plusplus': 'off',
        'no-unused-expressions': 'off',
        'class-methods-use-this': 'off',
        'import/no-extraneous-dependencies': 'off',
        'require-jsdoc': 'off',
      },
    },
  ],
  ignorePatterns: [
    '**/*.d.ts',
  ],
  rules: {
    'arrow-parens': [
      'error',
      'always',
      {
        'requireForBlockBody': true,
      },
    ],
    'lines-between-class-members': 'error',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': [
      // this is unnecessary for node apps.
      'off',
      {
        'exceptMethods': [],
      },
    ],
    'no-undef': 'error',
    'require-jsdoc': ['warn', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: true,
        FunctionExpression: true,
      },
    }],
    // 'comma-dangle': 'warn',
    'new-cap': [
      'error',
      {
        properties: false,
        capIsNew: false,
      },
    ],
    'max-len': [
      'error',
      {
        code: 120,
      },
    ],
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'no-console': [
      'error',
    ],
    'no-unused-expressions': 'error',
    'prefer-template': 'error',
    'no-return-await': 'error',
    'no-template-curly-in-string': 'error',
    'indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 0,
        MemberExpression: 0,
      },
    ],
    'no-shadow': [
      'error',
      {
        builtinGlobals: true,
      },
    ],
  },
};

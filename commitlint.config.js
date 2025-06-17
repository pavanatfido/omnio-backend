module.exports = {
  extends: ['@commitlint/config-conventional'],
  // optional: scope always required
  rules: {
    'scope-empty': [2, 'never'],
  },
};

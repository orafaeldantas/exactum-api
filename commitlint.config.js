module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'format', 'perf', 'chore', 'docs', 'ci', 'style', 'test']],
      'scope-enum': [2, 'always', ['ui', 'frontend', 'api', 'backend', 'db', 'infra', 'repo']],
    },
  };
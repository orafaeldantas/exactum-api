module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'format', 'perf', 'chore', 'docs']],
      'scope-enum': [2, 'always', ['ui', 'frontend', 'api', 'backend', 'db', 'infra', 'repo']],
    },
  };
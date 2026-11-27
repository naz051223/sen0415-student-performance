import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist*/**', '.grafana-local/**'] },
  { files: ['**/*.{js,mjs}'], ...js.configs.recommended },
  ...tseslint.configs.recommended,
  { files: ['trend/*.js', 'score-data/*.js'], languageOptions: { globals: { define: 'readonly' } } },
  { files: ['*.mjs'], languageOptions: { globals: { console: 'readonly', URL: 'readonly' } } },
  { files: ['tests/*.mjs'], languageOptions: { globals: { test: 'readonly', URL: 'readonly' } } },
];

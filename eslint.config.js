import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-unused-vars': 'off',
            'no-undef': 'off',
        },
    },
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/.next/**',
            '**/reports/**',
            'packages/contracts/**',
        ],
    },
);

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        rules: {
            // 규칙 추가
            '@typescript-eslint/no-explicit-any': 'warn', // any 사용을 경고로 설정
        },
    },
];

export default eslintConfig;

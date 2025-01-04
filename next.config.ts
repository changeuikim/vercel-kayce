import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    webpack: (config) => {
        // .graphql 파일을 처리하는 로더 추가
        config.module.rules.push({
            test: /\.graphql$/,
            exclude: /node_modules/,
            loader: '@graphql-tools/webpack-loader', // 사용할 로더
        });

        return config; // 수정된 Webpack 설정 반환
    },
};

export default nextConfig;

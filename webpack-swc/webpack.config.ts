import path from 'path';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import dotenv from 'dotenv';
import DotEnv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration } from 'webpack';
import { CustomizeRule, merge, mergeWithRules } from 'webpack-merge';

import pkg from './package.json';

const resolveRoot = (...paths: string[]) => path.resolve(__dirname, ...paths);
const resolveOut = (...paths: string[]) => resolveRoot('.build', ...paths);

const NODE_ENV = (process.env.NODE_ENV as 'development' | 'production') || 'development';
const isDev = NODE_ENV === 'development';

const dotenvPath = resolveRoot(`.env.${NODE_ENV}`);
dotenv.config({ path: dotenvPath });

const getPublicPath = () => (isDev ? '/' : process.env.PUBLIC_PATH);

const cssLoaders = [
    {
        loader: MiniCssExtractPlugin.loader,
    },
    {
        loader: 'css-loader',
        options: {
            modules: {
                auto: true,
                localIdentName: isDev ? '[name]__[local]--[hash:base64:5]' : '[hash:base64:7]',
            },
        },
    },
    'postcss-loader',
];

const sassLoader = {
    loader: 'sass-loader',
};

const commonConfig: Configuration = {
    target: 'web',
    entry: './src/index.tsx',
    plugins: [
        new DotEnv({
            path: dotenvPath,
            systemvars: false,
            allowEmptyValues: true,
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: resolveRoot('public'),
                    to: resolveOut(),
                    globOptions: {
                        ignore: ['**/*.html'],
                    },
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: resolveRoot('public', 'index.html'),
            filename: 'index.html',
            inject: true,
            base: {
                href: getPublicPath(),
            },
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[name].[contenthash].css',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [...cssLoaders],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [...cssLoaders, sassLoader],
            },
            {
                test: /\.tsx?$/,
                loader: 'swc-loader',
                exclude: /node_modules/,
                options: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                            transform: {
                                react: {
                                    runtime: 'automatic',
                                },
                            },
                        },
                        externalHelpers: true,
                    },
                    env: {
                        targets: pkg.browserslist[NODE_ENV],
                    },
                },
            },
            {
                test: /\.jsx?$/,
                loader: 'swc-loader',
                exclude: /node_modules/,
                options: {
                    jsc: {
                        parser: {
                            syntax: 'ecmascript',
                            jsx: false,
                        },
                        externalHelpers: true,
                    },
                    env: {
                        targets: pkg.browserslist[NODE_ENV],
                    },
                    isModule: 'unknown',
                },
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: '@svgr/webpack',
                        options: {
                            svgoConfig: {
                                plugins: [
                                    {
                                        removeViewBox: false,
                                    },
                                ],
                            },
                            memo: true,
                            svgProps: {
                                width: '24px',
                                height: '24px',
                            },
                        },
                    },
                    'url-loader',
                ],
            },
            // images
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            // fonts
            {
                test: /\.(woff|ttf|eot)$/i,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};

const developmentConfig = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    output: {
        path: resolveOut(),
        publicPath: getPublicPath(),
    },
    optimization: {
        minimize: false,
        runtimeChunk: false,
    },
    devServer: {
        port: process.env.PORT || 8000,
        hot: true,
        historyApiFallback: true,
        client: {
            overlay: {
                warnings: false,
                errors: true,
            },
        },
        devMiddleware: {
            writeToDisk: true,
        },
    },
} as Configuration);

const productionConfig: Configuration = mergeWithRules({
    module: {
        rules: {
            test: CustomizeRule.Match,
            use: CustomizeRule.Replace,
        },
    },
})(commonConfig, {
    mode: 'production',
    devtool: false,
    devServer: false,
    output: {
        path: resolveOut(),
        publicPath: getPublicPath(),
        filename: '[name].[contenthash].js',
        sourceMapFilename: '[name].[contenthash].js.map',
    },
    optimization: {
        minimize: true,
        runtimeChunk: false,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                    output: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ],
    },
} as Configuration);

export default isDev ? developmentConfig : productionConfig;

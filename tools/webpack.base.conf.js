'use strict';

const webpack = require('webpack');
const path = require('path');
const config = require('../config');
const utils = require('./utils');
const eslintFormatter = require('eslint-friendly-formatter');

const projectRoot = path.resolve(__dirname, '../');
const isProduction = process.env.NODE_ENV === 'production';
const vueLoaderOptions = {
    loaders: utils.cssLoaders({
        sourceMap: isProduction ?
            config.build.productionSourceMap : config.dev.cssSourceMap,
        extract: isProduction,
    }),
    postcss: [
        require('autoprefixer')({
            browsers: ['last 2 versions'],
        }),
    ],
};

module.exports = {
    entry: {
        app: ['./src/main.js'],
    },
    resolve: {
        extensions: ['.js', '.vue'],
        modules: [path.join(__dirname, '../node_modules')],
        alias: {
            src: path.resolve(__dirname, '../src'),
            assets: path.resolve(__dirname, '../src/assets'),
            components: path.resolve(__dirname, '../src/components'),
        },
    },
    resolveLoader: {
        modules: [path.join(__dirname, '../node_modules')],
    },
    module: {
        rules: [{
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            enforce: 'pre',
            options: { formatter: eslintFormatter },
            include: projectRoot,
            exclude: /node_modules/,
        },
        {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: vueLoaderOptions,
            include: projectRoot,
            exclude: /node_modules/,
        },
        {
            test: /\.js$/,
            loader: 'babel-loader',
            include: projectRoot,
            exclude: /node_modules/,
        },
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: utils.assetsPath('image/[name].[hash:7].[ext]'),
            },
        },
        {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
            },
        },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            d3: 'd3',
        }),
    ],
};

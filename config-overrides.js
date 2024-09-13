// const rewirePostCss = require('react-app-rewire-postcss')
const webpack = require('webpack')
const rewirePostCss = require('react-app-rewire-postcss')

module.exports = function override(config, env) {
    config = rewirePostCss(config, true)

    config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        assert: require.resolve('assert/'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        http: require.resolve('stream-http'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process')
    }
    config.resolve.extensions = [...config.resolve.extensions, '.ts', '.js']
    config.plugins = [
        ...config.plugins,
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser.js'
        })
    ]

    if (env !== 'production') {
        return config
    }

    if (!config.optimization) {
        config.optimization = {}
    }
    config.optimization.splitChunks = { chunks: 'all', name: false }
    config.optimization.minimize = true

    return config
}

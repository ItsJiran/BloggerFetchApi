const path = require('path');

module.exports = {
    entry: './src/',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                use: 'babel-loader'
            }
        ]
    },
    optimization: {
        minimize: false
    }
};
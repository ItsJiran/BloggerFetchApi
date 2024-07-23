const path = require('path');

module.exports = {
    entry: './src/',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'var',
        library: 'YourLibraryNameHere'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.ts']
    },
    devtool: 'inline-source-map',
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
const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist', 'static'),
        filename: 'main.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts|jsx|js)$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|tif|tiff)$/,
                type: 'asset/resource',
            },
            {
                test: /\.geojson$/,
                type: 'json',
            },
        ],
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.tsx', '.ts'],
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        compress: true,
        port: 30000,
        allowedHosts: 'all',
    },
};

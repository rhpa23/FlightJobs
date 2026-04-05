const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  externals: [],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: 'commonjs',
              target: 'ES2021',
              experimentalDecorators: true,
              emitDecoratorMetadata: true,
              strictPropertyInitialization: false,
              skipLibCheck: true,
            },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssNormalize = require('postcss-normalize')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const postcssConfig = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      ident: 'postcss',
      plugins: [
        'postcss-flexbugs-fixes',
        [
          'postcss-preset-env',
          {
            browsers: '> 5% in KR, defaults, not IE < 11',
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          },
        ],
        postcssNormalize(),
      ],
    },
    sourceMap: true,
  },
}
module.exports = {
  mode: 'development',
  entry: {
    bundle: ['./example/src/index.tsx'],
  },
  devtool: 'eval-source-map',
  output: {
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'example/public'),
    },
    compress: true,
    hot: true,
  },
  plugins: [new MiniCssExtractPlugin(), new ReactRefreshWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [
                require.resolve('react-refresh/babel'),
                '@emotion',
                'babel-plugin-macros',
              ].filter(Boolean),
            },
          },
        ],
      },
      { test: /\.ts|.tsx$/, exclude: /node_modules/, use: ['ts-loader'] },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', postcssConfig],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', postcssConfig, 'sass-loader'],
      },
    ],
  },
}

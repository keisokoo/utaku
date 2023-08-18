import { DEFAULT_EXTENSIONS } from '@babel/core'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import path from 'path'
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss'

import zip from 'rollup-plugin-zip'

const isProduction = process.env.NODE_ENV === 'production'
const defaultConfig = {
  context: 'window',
  input: {
    background: 'src/background/index.ts',
    popup: 'src/pages/popup/index.tsx',
    options: 'src/pages/options/index.tsx',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name]/index.js',
    chunkFileNames: path.join('chunks', '[name].js'),
  },
  plugins: [
    typescript({
      target: 'es2016',
    }),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
    resolve({
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
      moduleDirectories: ['node_modules'],
    }),
    babel({
      extensions: [...DEFAULT_EXTENSIONS, '.ts', 'tsx'],
      exclude: /node_modules/,
      babelHelpers: 'bundled',
      presets: [['@babel/preset-env', { modules: false }]],
    }),
    commonjs({
      include: /node_modules/,
    }),
    copy({
      targets: [
        { src: 'public/*', dest: 'dist' }, // public 폴더의 모든 파일을 dist 폴더로 복사
      ],
    }),
    isProduction && zip({ dir: 'releases' }),
  ],
}
export default [
  {
    ...defaultConfig,
    plugins: [
      ...defaultConfig.plugins,
      postcss({
        extract: path.resolve('dist/index.css'),
        modules: false,
        use: ['sass'],
      }),
    ],
  },
  {
    ...defaultConfig,
    input: 'src/content/index.tsx',
    output: {
      dir: 'dist',
      format: 'iife',
      entryFileNames: 'content/index.js',
    },
    plugins: [
      ...defaultConfig.plugins,
      postcss({
        extract: path.resolve('dist/content/index.css'),
        modules: false,
        use: ['sass'],
      }),
    ],
  },
]

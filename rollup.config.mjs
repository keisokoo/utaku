import { DEFAULT_EXTENSIONS } from '@babel/core'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import path from 'path'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import postcss from 'rollup-plugin-postcss'

import zip from 'rollup-plugin-zip'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  input: {
    background: 'src/background/index.ts',
    popup: 'src/pages/popup/index.tsx',
    options: 'src/pages/options/index.tsx',
    content: 'src/content/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name]/index.js',
    chunkFileNames: path.join('chunks', '[name]-[hash].js'),
  },
  plugins: [
    typescript({
      target: 'es2016',
    }),
    postcss({
      extract: path.resolve('dist/content/index.css'),
      modules: true,
      use: ['sass'],
    }),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
    resolve({
      moduleDirectories: ['node_modules'],
    }),
    babel({
      extensions: [...DEFAULT_EXTENSIONS, '.ts', 'tsx'],
      exclude: /node_modules/,
      babelHelpers: 'bundled',
    }),
    commonjs({
      include: /node_modules/,
    }),
    copy({
      targets: [
        { src: 'public/*', dest: 'dist' }, // public 폴더의 모든 파일을 dist 폴더로 복사
      ],
    }),
    del({ targets: 'dist/*' }),
    isProduction && zip({ dir: 'releases' }),
  ],
}

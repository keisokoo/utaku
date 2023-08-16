import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import fs from 'fs'
import * as glob from 'glob'
import path from 'path'

import replace from '@rollup/plugin-replace'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import { emptyDir } from 'rollup-plugin-empty-dir'
import zip from 'rollup-plugin-zip'

const isProduction = process.env.NODE_ENV === 'production'
const commonjsHelpers = `var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

export { commonjsGlobal as c, getDefaultExportFromCjs as g };
`
export default {
  input: 'src/manifest.json',
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: path.join('chunks', '[name]-[hash].js'),
  },
  plugins: [
    {
      name: 'modify-import-path',
      writeBundle() {
        // dist/chunks 폴더의 모든 js 파일을 찾기
        const files = glob.sync('dist/chunks/client-*.js')

        files.forEach((file) => {
          let content = fs.readFileSync(file, 'utf8')
          let lines = content.split('\n')

          lines = lines.map((line) => {
            const match = line.match(
              /import \{ (\w+) \} from '(.+chunks\/_commonjsHelpers-\w+\.js)';/
            )
            if (match) {
              const identifier = match[1]
              const newPath = './' + path.basename(match[2])
              return `import { ${identifier} } from '${newPath}';`
            }
            return line
          })

          content = lines.join('\n')
          fs.writeFileSync(file, content)
          console.log(`Updated file: ${file}`)
        })
      },
    },
    {
      name: 'create-file-with-content',
      writeBundle() {
        const filePath = path.resolve('dist/pages/popup/index.js')

        // 파일의 내용을 라인별로 읽음
        let fileContent = fs.readFileSync(filePath, 'utf8')
        const lines = fileContent.split('\n')

        lines.forEach((line) => {
          if (line.includes('_commonjsHelpers')) {
            const match = line.match(/_commonjsHelpers-(\w+)\.js/)
            if (match) {
              const hashValue = match[1]

              // 새로운 파일의 내용
              const content = commonjsHelpers

              // 파일을 생성
              const outputPath = path.resolve(
                `dist/chunks/_commonjsHelpers-${hashValue}.js`
              )
              fs.writeFileSync(outputPath, content.trim())
              console.log(`File created at ${outputPath}`)
            }
          }
        })
      },
    },
    {
      name: 'remove-line',
      writeBundle() {
        const popupPath = path.resolve('dist/pages/popup/index.js')
        const optionsPath = path.resolve('dist/pages/options/index.js')
        function removeChunkCommonjs(filePath) {
          // 파일의 내용을 라인별로 읽음
          let fileContent = fs.readFileSync(filePath, 'utf8')
          const lines = fileContent.split('\n')

          // 특정 라인을 찾아 제거
          const newLines = lines.filter(
            (line) => !line.includes('chunks/_commonjsHelpers')
          )

          // 새로운 내용으로 파일에 쓰기
          fs.writeFileSync(filePath, newLines.join('\n'), 'utf8')
        }
        removeChunkCommonjs(popupPath)
        removeChunkCommonjs(optionsPath)
      },
    },
    {
      name: 'modify-manifest',
      writeBundle(options, bundle) {
        const manifestPath = 'dist/manifest.json'
        let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        manifest.action = {
          default_icon: {
            34: 'icon34.png',
            128: 'icon128.png',
          },
        }
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
      },
    },
    replace({
      'process.env.NODE_ENV': isProduction
        ? JSON.stringify('production')
        : JSON.stringify('development'),
      preventAssignment: true,
    }),
    chromeExtension(),
    simpleReloader(),
    resolve(),
    commonjs(),
    typescript(),
    emptyDir(),
    isProduction && zip({ dir: 'releases' }),
  ],
}

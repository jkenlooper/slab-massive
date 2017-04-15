import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import html from 'rollup-plugin-html'

// Modified rollup-plugin-postcss to store the css in a var
import rollupPostcssInline from './src/rollup-postcss-inline.js'

import postcssImport from 'postcss-import'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssCustomMedia from 'postcss-custom-media'
import postcssCalc from 'postcss-calc'
import autoprefixer from 'autoprefixer'
import postcssUrl from 'postcss-url'
import cssnano from 'cssnano'

export default {
  entry: 'src/main.js',
  format: 'es',
  // moduleName: 'slab-massive',
  plugins: [
    json(),
    html({
      include: 'src/**/*.html',
      htmlMinifierOptions: {
        caseSensitive: true,
        html5: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeTagWhitespace: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        conservativeCollapse: true,
        minifyJS: true
      }
    }),
    rollupPostcssInline({
      plugins: [
        postcssImport(),
        postcssCustomProperties(),
        postcssCustomMedia(),
        postcssCalc(),
        autoprefixer(),
        postcssUrl(),
        cssnano()
      ],
      sourceMap: false,
      extract: true,
      extensions: ['.css']
    }),
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  dest: 'dist/slab-massive.min.js'
}

import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import html from 'rollup-plugin-html'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

// Modified rollup-plugin-postcss to store the css in a var
import rollupPostcssInline from './src/rollup-postcss-inline.js'

import postcssImport from 'postcss-import'
import postcssCustomMedia from 'postcss-custom-media'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

const plugins = [
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
        postcssCustomMedia(),
        autoprefixer(),
        cssnano()
      ],
      sourceMap: false,
      extract: true,
      extensions: ['.css']
    })
  ]

export default [
	// browser-friendly UMD build
  {
    input: 'src/main.js',
    output: {
      name: 'slab-massive',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: plugins.concat([
      resolve(),
      commonjs()
    ])
  },

	// CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/main.js',
    external: [],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: plugins
  }
]

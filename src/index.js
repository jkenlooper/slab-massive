// Depends on webcomponents.js polyfill to be in head
require('file?name=[name].[ext]!../node_modules/webcomponents.js/webcomponents.min.js')

import SlabMassive from './slab-massive.js'

document.registerElement('slab-massive', SlabMassive)

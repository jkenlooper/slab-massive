/* global HTMLElement */
import style from './slab.css'
import template from './slab-massive.html'

const html = `
  <style>${style}</style>
  ${template}
  `
class SlabMassive extends HTMLElement {
  // Fires when an instance of the element is created.
  createdCallback () {
    console.log('created')
    this.createShadowRoot().innerHTML = html
    this.slab = this.shadowRoot.querySelector('.sm-Slab')
    this.container = this.shadowRoot.querySelector('.sm-Slab-container')
    this.slot = this.shadowRoot.querySelector('.sm-Slab-slot')
    this.viewFinder = this.shadowRoot.querySelector('.sm-ViewFinder')
    this.viewFinderBox = this.shadowRoot.querySelector('.sm-ViewFinder-box')

    this.render()
    let zoomInEl = this.shadowRoot.querySelector('.sm-Slab-zoomIn')
    let zoomIn = this.zoomIn.bind(this)
    zoomInEl.addEventListener('click', zoomIn)
    let zoomOutEl = this.shadowRoot.querySelector('.sm-Slab-zoomOut')
    let zoomOut = this.zoomOut.bind(this)
    zoomOutEl.addEventListener('click', zoomOut)
  }

  // Fires when an instance was inserted into the document.
  attachedCallback () {}

  // Fires when an attribute was added, removed, or updated.
  attributeChangedCallback (attrName, oldVal, newVal) {
    if (oldVal !== newVal) {
      console.log('change', attrName)
      this[attrName] = newVal
    }
    switch (attrName) {
      case 'zoom':
        this.renderSlotPosition()
        break
      case 'offset-x':
        this.renderSlotPosition()
        break
      case 'offset-y':
        this.renderSlotPosition()
        break
      case 'scale':
        this.render()
        break
      case 'width':
        this.render()
        break
      case 'height':
        this.render()
        break
    }
  }

  render () {
    console.log('render', this.slab)
    this.slab.style.width = (this.width * this.scale) + 'px'
    this.slab.style.height = (this.height * this.scale) + 'px'

    this.container.style.width = this.width + 'px'
    this.container.style.height = this.height + 'px'
    this.container.style.transform = `scale(${this.scale})`
    this.container.style.marginLeft = ((this.width / 2) * -1) + 'px'
    this.container.style.marginTop = ((this.height / 2) * -1) + 'px'

    this.viewFinder.scale = (150 / this.width)
    this.viewFinder.style.width = '150px'
    this.viewFinder.style.height = Math.floor(this.viewFinder.scale * this.height) + 'px'
    this.viewFinderBox.style.height = Math.floor(this.height * this.viewFinder.scale) + 'px'
    this.viewFinderBox.style.width = Math.floor(this.width * this.viewFinder.scale) + 'px'

    this.slot.style.width = this.width + 'px'
    this.slot.style.height = this.height + 'px'
    this.renderSlotPosition()
  }

  renderSlotPosition () {
    this.slot.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.zoom})`

    // Update the viewFinder box position and size
    console.log(`translate(${Math.floor((this.offsetX / this.zoom) * this.viewFinder.scale)}px, ${Math.floor((this.offsetY / this.zoom) * this.viewFinder.scale)}px)`)
    //this.viewFinderBox.style.transform = `translate(${Math.floor((this.offsetX / this.zoom) * this.viewFinder.scale)}px, ${Math.floor((this.offsetY / this.zoom) * this.viewFinder.scale)}px)`
    this.viewFinderBox.style.transform = `scale(${1 / this.zoom}) translate(${Math.floor((this.offsetX / this.zoom) * this.viewFinder.scale)}px, ${Math.floor((this.offsetY / this.zoom) * this.viewFinder.scale)}px)`
  }

  zoomIn () {
    this.setAttribute('zoom', this.zoom * 2)
  }

  zoomOut () {
    this.setAttribute('zoom', Math.max(this.zoom / 2, 1.0))
  }

  // Reflect the width prop with the attr
  get scale () {
    return this.getAttribute('scale')
  }
  set scale (val) {
    this.setAttribute('scale', val)
  }

  get zoom () {
    return this.getAttribute('zoom')
  }
  set zoom (val) {
    this.setAttribute('zoom', val)
  }

  get offsetX () {
    return this.getAttribute('offset-x')
  }
  set offsetX (val) {
    this.setAttribute('offset-x', val + 'px')
  }

  get offsetY () {
    return this.getAttribute('offset-y')
  }
  set offsetY (val) {
    this.setAttribute('offset-y', val + 'px')
  }

  get width () {
    return this.getAttribute('width')
  }
  set width (val) {
    this.setAttribute('width', val)
  }

  get height () {
    return this.getAttribute('height')
  }
  set height (val) {
    this.setAttribute('height', val)
  }
}

export default SlabMassive

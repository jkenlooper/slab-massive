/* global HTMLElement */
import style from './slab.css'
import template from './slab-massive.html'

let html = `
  <style>${style}</style>
  ${template}
  `
class SlabMassive extends HTMLElement {
  // Fires when an instance of the element is created.
  createdCallback () {
    this.createShadowRoot().innerHTML = html
    this.element = this.shadowRoot.querySelector('.sm-Slab')
    this.container = this.shadowRoot.querySelector('.sm-Slab-container')
    this.slot = this.shadowRoot.querySelector('.sm-Slab-slot')
    this.render()
  }

  // Fires when an instance was inserted into the document.
  attachedCallback () {}

  // Fires when an attribute was added, removed, or updated.
  attributeChangedCallback (attrName, oldVal, newVal) {
    console.log('change', attrName)
  }

  render () {
    this.element.style.width = (this.width * this.scale) + 'px'
    this.element.style.height = (this.height * this.scale) + 'px'

    this.container.style.width = this.width + 'px'
    this.container.style.height = this.height + 'px'
    this.container.style.transform = `scale(${this.scale})`
    this.container.style.marginLeft = ((this.width / 2) * -1) + 'px'
    this.container.style.marginTop = ((this.height / 2) * -1) + 'px'

    this.slot.style.width = this.width + 'px'
    this.slot.style.height = this.height + 'px'
    this.renderSlotPosition()
  }

  renderSlotPosition () {
    this.slot.style.transform = `translate(${this.offsetX}, ${this.offsetY}) scale(${this.zoom})`
  }

  // Reflect the width prop with the attr
  get scale () {
    return this.getAttribute('scale')
  }
  set scale (val) {
    this.setAttribute('scale', val)
    this.render()
  }

  get offsetX () {
    return this.getAttribute('offset-x')
  }
  set offsetX (val) {
    this.setAttribute('offset-x', val + 'px')
    this.renderSlotPosition()
  }

  get offsetY () {
    return this.getAttribute('offset-y')
  }
  set offsetY (val) {
    this.setAttribute('offset-y', val + 'px')
    this.renderSlotPosition()
  }

  get width () {
    return this.getAttribute('width')
  }
  set width (val) {
    this.setAttribute('width', val)
    this.render()
  }

  get height () {
    return this.getAttribute('height')
  }
  set height (val) {
    this.setAttribute('height', val)
    this.render()
  }
}

export default SlabMassive

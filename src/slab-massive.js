/* global HTMLElement */
import Hammer from 'hammerjs'
import style from './slab-massive.css'
import template from './slab-massive.html'

const html = `
  <style>${style}</style>
  ${template}
  `
class SlabMassive extends HTMLElement {
  // Fires when an instance of the element is created.
  createdCallback () {
    this.style.display = 'block'

    this.createShadowRoot().innerHTML = html
    this.slab = this.shadowRoot.querySelector('.sm-Slab')
    this.container = this.shadowRoot.querySelector('.sm-Slab-container')
    this.slot = this.shadowRoot.querySelector('.sm-Slab-slot')
    this.slotWrapper = this.shadowRoot.querySelector('.sm-Slab-slotWrapper')
    this.viewFinder = this.shadowRoot.querySelector('.sm-ViewFinder')
    this.viewFinderBox = this.shadowRoot.querySelector('.sm-ViewFinder-box')
    this.viewFinder.x = (this.viewFinder.offsetLeft + this.offsetLeft)
    this.viewFinder.y = (this.viewFinder.offsetTop + this.offsetTop)

    this.render()
    let zoomInEl = this.shadowRoot.querySelector('.sm-Slab-zoomIn')
    let zoomIn = this.zoomIn.bind(this)
    zoomInEl.addEventListener('click', zoomIn)
    let zoomOutEl = this.shadowRoot.querySelector('.sm-Slab-zoomOut')
    let zoomOut = this.zoomOut.bind(this)
    zoomOutEl.addEventListener('click', zoomOut)

    let handleScroll = this.handleScroll.bind(this)
    this.container.addEventListener('scroll', handleScroll)

    let mc = new Hammer.Manager(this.viewFinder, {})
    mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }))
    mc.add(new Hammer.Tap())
    mc.on('tap panstart panmove panend', Hammer.bindFn(this.viewFinderClick, this))
  }

  // Fires when an instance was inserted into the document.
  attachedCallback () {}

  // Fires when an attribute was added, removed, or updated.
  attributeChangedCallback (attrName, oldVal, newVal) {
    if (oldVal !== newVal) {
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
    if (this.scale === '0') {
      console.log('window innerWidth', window.innerWidth)
      // Set the initial scale so the slab fills the width of the window.
      this.scale = (window.innerWidth / this.width)
    }
    this.style.width = (this.width * this.scale) + 'px'
    this.style.height = (this.height * this.scale) + 'px'
    this.slab.style.width = (this.width * this.scale) + 'px'
    this.slab.style.height = (this.height * this.scale) + 'px'
    this.container.style.width = (this.width * this.scale) + 'px'
    this.container.style.height = (this.height * this.scale) + 'px'

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
    this.slotWrapper.style.width = ((this.width * this.scale) * this.zoom) + 'px'
    this.slotWrapper.style.height = ((this.height * this.scale) * this.zoom) + 'px'
    // this.slot.style.transform = `scale(${this.zoom}) translate(${this.offsetX}px, ${this.offsetY}px)`
    this.slot.style.transform = `scale(${this.scale * this.zoom})`
    //this.container.scrollLeft = this.offsetX
    //this.container.scrollTop = this.offsetY

    // Update the viewFinder box position and size
    this.viewFinderBox.style.transform = `translate(${(Math.floor(this.offsetX * this.viewFinder.scale) * -1)}px, ${(Math.floor(this.offsetY * this.viewFinder.scale) * -1)}px) scale(${1 / this.zoom})`
  }

  moveBy (x, y) {
    this.pageToOffset(this.viewFinder.x + x, this.viewFinder.y + y)
  }
  moveTo (x, y) {
    this.viewFinder.x += x
    this.viewFinder.y += y
    this.pageToOffset(this.viewFinder.x, this.viewFinder.y)
  }

  pageToOffset (pageX, pageY) {
    // position the viewFinder box to the center of the click
    let x = pageX - (this.viewFinder.offsetLeft + this.offsetLeft)
    let y = pageY - (this.viewFinder.offsetTop + this.offsetTop)
    this.container.scrollLeft = (x / this.viewFinder.scale)
    this.container.scrollTop = (y / this.viewFinder.scale)
    // this.offsetX = ((x - 150 / 2) / this.viewFinder.scale) * -1
    // this.offsetY = ((y - (this.viewFinder.scale * this.height) / 2) / this.viewFinder.scale) * -1
  }

  viewFinderClick (ev) {
    switch (ev.type) {
      case 'tap':
        this.pageToOffset(ev.pointers[0].pageX, ev.pointers[0].pageY)
        break
      case 'panstart':
        this.viewFinderBox.classList.add('is-dragging')
        this.slot.classList.add('is-dragging')
        this.viewFinderBox.x = ev.pageX
        this.viewFinderBox.y = ev.pageY
        break
      case 'panmove':
        // Drag the element
        this.moveBy(ev.deltaX, ev.deltaY)
        break
      case 'panend':
        // Save the new position
        this.viewFinderBox.classList.remove('is-dragging')
        this.slot.classList.remove('is-dragging')
        this.moveTo(ev.deltaX, ev.deltaY)
        break
    }
  }

  zoomIn () {
    this.setAttribute('zoom', this.zoom * 2)
  }

  zoomOut () {
    this.setAttribute('zoom', Math.max(this.zoom / 2, 1.0))
  }

  handleScroll (ev) {
    console.log('scroll', this.container.scrollLeft, this.offsetX)
    console.log(this.container.scrollLeft * this.viewFinder.scale, this.container.scrollTop * this.viewFinder.scale)
    let x = (this.container.scrollLeft * this.viewFinder.scale)
    let y = (this.container.scrollTop * this.viewFinder.scale)
    this.offsetX = (x / this.viewFinder.scale)
    this.offsetY = (y / this.viewFinder.scale)
    // this.pageToOffset(this.container.scrollLeft * this.viewFinder.scale, this.container.scrollTop * this.viewFinder.scale)

    /*
    let pageX = this.container.scrollLeft * this.viewFinder.scale
    let pageY = this.container.scrollTop * this.viewFinder.scale
    let x = pageX - (this.viewFinder.offsetLeft + this.offsetLeft)
    let y = pageY - (this.viewFinder.offsetTop + this.offsetTop)
    let offsetX = ((x - 150 / 2) / this.viewFinder.scale) * -1
    let offsetY = ((y - (this.viewFinder.scale * this.height) / 2) / this.viewFinder.scale) * -1
    this.viewFinderBox.style.transform = `translate(${(Math.floor(offsetX * this.viewFinder.scale) * -1)}px, ${(Math.floor(offsetY * this.viewFinder.scale) * -1)}px) scale(${1 / this.zoom})`
    */
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
    this.setAttribute('offset-x', val)
  }

  get offsetY () {
    return this.getAttribute('offset-y')
  }
  set offsetY (val) {
    this.setAttribute('offset-y', val)
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

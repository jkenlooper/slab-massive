/* global HTMLElement */
import Hammer from 'hammerjs'
import ScrollAnimation from './scroll-animation.js'
import style from './slab-massive.css'
import template from './slab-massive.html'

const html = `
  <style>${style}</style>
  ${template}
  `
const viewFinderWidth = 150

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
      let event = new window.CustomEvent(attrName + '-change', {detail: newVal})
      this.dispatchEvent(event)
    }
    switch (attrName) {
      case 'zoom':
        this.renderZoom()
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
      case 'fill':
        this.render()
        break
    }
  }

  render () {
    if (this.scale === '0') {
      // Set the initial scale so the slab best fills the width of its container.
      let parentWidth = this.parentNode.offsetWidth
      let parentHeight = this.parentNode.offsetHeight
      if (this.fill === 'contain') {
        if (((parentWidth / this.width) * this.height) > parentHeight) {
          this.scale = (parentHeight / this.height)
        } else {
          this.scale = (parentWidth / this.width)
        }
      } else if (this.fill === 'auto') {
        // best guess
        if ((parentWidth > parentHeight) && (this.width > this.height)) {
          this.scale = parentHeight / this.height
        } else if ((parentWidth < parentHeight) && (this.width < this.height)) {
          this.scale = parentWidth / this.width
        } else {
          // ...
          this.scale = parentWidth / this.width
        }
      } else { // fill = cover
        this.scale = parentWidth / this.width
      }
    }
    this.style.width =
      this.slab.style.width =
      this.container.style.width =
      (this.width * this.scale) + 'px'
    this.style.height =
      this.slab.style.height =
      this.container.style.height =
      (this.height * this.scale) + 'px'

    this.viewFinder.scale = (viewFinderWidth / this.width)
    this.viewFinder.style.width = viewFinderWidth + 'px'
    this.viewFinder.style.height = Math.floor(this.viewFinder.scale * this.height) + 'px'
    this.viewFinderBox.style.height = Math.floor(this.height * this.viewFinder.scale) + 'px'
    this.viewFinderBox.style.width = Math.floor(this.width * this.viewFinder.scale) + 'px'

    this.slot.style.width = this.width + 'px'
    this.slot.style.height = this.height + 'px'
    this.renderZoom()
    this.renderSlotPosition()
  }

  renderZoom () {
    if (Number(this.zoom) === 1) {
      this.viewFinder.classList.add('is-zoom1')
    } else {
      this.viewFinder.classList.remove('is-zoom1')
    }
  }

  renderSlotPosition () {
    this.slotWrapper.style.width = ((this.width * this.scale) * this.zoom) + 'px'
    this.slotWrapper.style.height = ((this.height * this.scale) * this.zoom) + 'px'
    this.slot.style.transform = `scale(${this.scale * this.zoom})`

    // Update the viewFinder box position and size
    this.viewFinderBox.style.transform = `translate(${Math.floor(((this.offsetX * this.viewFinder.scale) / this.scale) / this.zoom)}px, ${Math.floor(((this.offsetY * this.viewFinder.scale) / this.scale) / this.zoom)}px) scale(${1 / this.zoom})`
    this.viewFinderBox.style.borderWidth = this.zoom + 'px'
  }

  moveBy (x, y) {
    this.pageToOffset(this.viewFinder.startX + x, this.viewFinder.startY + y)
  }
  moveTo (x, y) {
    this.pageToOffset(this.viewFinder.startX + x, this.viewFinder.startY + y)
  }

  pageToOffset (pageX, pageY, animate) {
    if (this.scrollAnimation) {
      this.scrollAnimation.stop()
      this.scrollAnimation = null
    }
    this.viewFinder.x = pageX
    this.viewFinder.y = pageY
    // position the viewFinder box to the center of the click
    let x = pageX - (this.viewFinder.offsetLeft + this.offsetLeft)
    let y = pageY - (this.viewFinder.offsetTop + this.offsetTop)
    // Trigger the scroll event for the container which will update the offsetX and offsetY.
    let scrollLeft = ((x / this.viewFinder.scale) * this.scale) * this.zoom
    let scrollTop = ((y / this.viewFinder.scale) * this.scale) * this.zoom
    if (animate) {
      this.scrollAnimation = new ScrollAnimation(this.container, scrollLeft, scrollTop)
    } else {
      this.container.scrollLeft = scrollLeft
      this.container.scrollTop = scrollTop
    }
  }

  handleScroll (ev) {
    let x = (this.container.scrollLeft * this.viewFinder.scale)
    let y = (this.container.scrollTop * this.viewFinder.scale)
    this.offsetX = (x / this.viewFinder.scale)
    this.offsetY = (y / this.viewFinder.scale)
  }

  viewFinderClick (ev) {
    // Position the click to the center of the viewFinderBox
    const x = ev.pointers[0].pageX - (this.viewFinderBox.offsetWidth / this.zoom) / 2
    const y = ev.pointers[0].pageY - (this.viewFinderBox.offsetHeight / this.zoom) / 2
    switch (ev.type) {
      case 'tap':
        this.pageToOffset(x, y, true)
        break
      case 'panstart':
        this.viewFinderBox.classList.add('is-dragging')
        this.slot.classList.add('is-dragging')
        this.viewFinder.x = this.viewFinder.startX = x
        this.viewFinder.y = this.viewFinder.startY = y
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

  get fill () {
    return this.getAttribute('fill')
  }
  set fill (val) {
    this.setAttribute('fill', val)
  }
}

export default SlabMassive

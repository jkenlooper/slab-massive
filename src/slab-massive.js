/* global HTMLElement, ScrollAnimation, style, template */
/* Manually importing these
import ScrollAnimation from './scroll-animation.js'
import style from './slab-massive.css'
import template from './slab-massive.html'
*/

const html = `
  <style>${style}</style>
  ${template}
  `
const viewFinderWidth = 150
const maximumScale = 1

window.customElements.define('slab-massive', class extends HTMLElement {
  constructor () {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.innerHTML = html

    this.slab = shadowRoot.querySelector('.sm-Slab')
    this.container = shadowRoot.querySelector('.sm-Slab-container')
    this._slot = shadowRoot.querySelector('.sm-Slab-slot')
    this.slotWrapper = shadowRoot.querySelector('.sm-Slab-slotWrapper')
    this.viewFinder = shadowRoot.querySelector('.sm-ViewFinder')
    this.viewFinderBox = shadowRoot.querySelector('.sm-ViewFinder-box')
    this.viewFinder.x = (this.viewFinder.offsetLeft + this.offsetLeft)
    this.viewFinder.y = (this.viewFinder.offsetTop + this.offsetTop)

    this.zoomInEl = shadowRoot.querySelector('.sm-Slab-zoomIn')
    let zoomIn = this.zoomIn.bind(this)
    this.zoomInEl.addEventListener('click', zoomIn)
    this.zoomOutEl = shadowRoot.querySelector('.sm-Slab-zoomOut')
    let zoomOut = this.zoomOut.bind(this)
    this.zoomOutEl.addEventListener('click', zoomOut)

    this.render()

    let handleScroll = this.handleScroll.bind(this)
    this.container.addEventListener('scroll', handleScroll)

    this.viewFinder.addEventListener('mousedown', this.handleViewFinderMousedown.bind(this))
  }

  // Fires when an instance was inserted into the document.
  connectedCallback () {}

  static get observedAttributes () {
    return [
      'zoom',
      'offset-x',
      'offset-y',
      'scale',
      'width',
      'height',
      'fill'
    ]
  }

  // Fires when an attribute was added, removed, or updated.
  attributeChangedCallback (attrName, oldVal, newVal) {
    if (oldVal !== newVal) {
      this[attrName] = newVal
      let event = new window.CustomEvent(attrName + '-change', {detail: newVal})
      this.dispatchEvent(event)
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
      } else { // fill = cover
        this.scale = parentWidth / this.width
      }
    }
    if (this.zoom === '0') {
      // Zoom in to the max
      this.zoom = maximumScale / this.scale
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

    this._slot.style.width = this.width + 'px'
    this._slot.style.height = this.height + 'px'
    this.renderZoom()
    this.renderSlotPosition()
  }

  renderZoom () {
    if (Number(this.zoom) === 1) {
      this.viewFinder.classList.add('is-zoom1')
    } else {
      this.viewFinder.classList.remove('is-zoom1')
    }
    // Disable zoom in button to prevent zooming in past the maximumScale
    if (maximumScale / this.scale === Number(this.zoom)) {
      this.zoomInEl.setAttribute('disabled', true)
    } else if (this.zoomInEl.hasAttribute('disabled')) {
      this.zoomInEl.removeAttribute('disabled')
    }

    // Prevent zooming out past 1
    if (Number(this.zoom) <= 1) {
      this.zoomOutEl.setAttribute('disabled', true)
    } else if (this.zoomOutEl.hasAttribute('disabled')) {
      this.zoomOutEl.removeAttribute('disabled')
    }
  }

  renderSlotPosition () {
    this.slotWrapper.style.width = ((this.width * this.scale) * this.zoom) + 'px'
    this.slotWrapper.style.height = ((this.height * this.scale) * this.zoom) + 'px'
    this._slot.style.transform = `scale(${this.scale * this.zoom})`

    // Update the viewFinder box position and size
    this.viewFinderBox.style.transform = `translate3d(${Math.floor(((this.offsetX * this.viewFinder.scale) / this.scale) / this.zoom)}px, ${Math.floor(((this.offsetY * this.viewFinder.scale) / this.scale) / this.zoom)}px, 0) scale(${1 / this.zoom})`
    this.viewFinderBox.style.borderWidth = this.zoom + 'px'
  }

  moveBy (x, y) {
    this.pageToOffset(this.viewFinder.startX + x, this.viewFinder.startY + y)
  }
  scrollTo (scrollLeft, scrollTop, animate) {
    if (this.scrollAnimation) {
      this.scrollAnimation.stop()
      this.scrollAnimation = null
    }
    if (animate) {
      this._slot.classList.add('is-animating')
      this.scrollAnimation = new ScrollAnimation(this.container, scrollLeft, scrollTop)
    } else {
      this._slot.classList.remove('is-animating')
      this.container.scrollLeft = scrollLeft
      this.container.scrollTop = scrollTop
    }
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
      this._slot.classList.add('is-animating')
      this.scrollAnimation = new ScrollAnimation(this.container, scrollLeft, scrollTop)
    } else {
      this._slot.classList.remove('is-animating')
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

  handleViewFinderMousedown (ev) {
    this.viewFinderClick({
      type: 'tap',
      pageX: ev.pageX,
      pageY: ev.pageY
    })
  }

  viewFinderClick (ev) {
    // Position the click to the center of the viewFinderBox
    const x = ev.pageX - (this.viewFinderBox.offsetWidth / this.zoom) / 2
    const y = ev.pageY - (this.viewFinderBox.offsetHeight / this.zoom) / 2
    switch (ev.type) {
      case 'tap':
        this.pageToOffset(x, y, true)
        break
      // TODO: Only tap is supported for now
      case 'panstart':
        this.viewFinderBox.classList.add('is-dragging')
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
        this.moveBy(ev.deltaX, ev.deltaY)
        break
    }
  }

  zoomIn () {
    const x = (Number(this.offsetX) * 2) + ((this.offsetWidth / 4) * 2)
    const y = (Number(this.offsetY) * 2) + ((this.offsetHeight / 4) * 2)
    const zoom = Math.min(maximumScale / this.scale, this.zoom * 2)
    this.setAttribute('zoom', zoom)
    // skip animating the scrollTo since the slab is also being zoomed
    this.scrollTo(x, y, false)
  }

  zoomOut () {
    const x = Math.max((Number(this.offsetX) / 2) - (this.offsetWidth / 4), 0)
    const y = Math.max((Number(this.offsetY) / 2) - (this.offsetHeight / 4), 0)
    this.setAttribute('zoom', Math.max(this.zoom / 2, 1.0))
    // skip animating the scrollTo since the slab is also being zoomed
    this.scrollTo(x, y, false)
  }

  // Reflect the prop with the attr
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
    if (val !== this.width) { this.setAttribute('width', val) }
  }

  get height () {
    return this.getAttribute('height')
  }
  set height (val) {
    if (val !== this.height) { this.setAttribute('height', val) }
  }

  get fill () {
    return this.getAttribute('fill')
  }
  set fill (val) {
    if (val !== this.fill) { this.setAttribute('fill', val) }
  }
})

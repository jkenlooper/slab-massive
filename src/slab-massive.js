/* global HTMLElement */
import ScrollAnimation from './scroll-animation.js'
import fullscreen from './fullscreen.js'
import debounce from './debounce.js'
import style from './index.css'
import template from './slab-massive.html'
import { version, description, author, repository } from '../package.json'
const html = `
<!--
Slab Massive ${version}
${description}
${author}
${repository.url}
-->
<style>${style}</style>
${template}
`
const viewFinderMax = 150
const maximumScale = 1

const tag = 'slab-massive'

window.customElements.define(tag, class SlabMassive extends HTMLElement {
  constructor () {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.innerHTML = html

    this.flags = {
      isMinimized: false
    }

    this.slab = shadowRoot.getElementById('sm-slab')
    this.container = shadowRoot.getElementById('sm-container')
    this._slot = shadowRoot.getElementById('sm-slot')
    this.slotWrapper = shadowRoot.getElementById('sm-slotwrapper')
    this.viewFinder = shadowRoot.getElementById('sm-viewfinder')
    this.viewFinderBox = shadowRoot.getElementById('sm-viewfinderbox')
    this.viewFinder.x = (this.viewFinder.offsetLeft + this.offsetLeft)
    this.viewFinder.y = (this.viewFinder.offsetTop + this.offsetTop)

    this.zoomInEl = shadowRoot.getElementById('sm-zoomin-button')
    let zoomIn = this.zoomIn.bind(this)
    this.zoomInEl.addEventListener('click', zoomIn)
    this.zoomOutEl = shadowRoot.getElementById('sm-zoomout-button')
    let zoomOut = this.zoomOut.bind(this)
    this.zoomOutEl.addEventListener('click', zoomOut)
    this.toggleEl = shadowRoot.getElementById('sm-toggle-button')
    this.toggleEl.addEventListener('click', this.toggle.bind(this))

    let handleScroll = this.handleScroll.bind(this)
    this.container.addEventListener('scroll', handleScroll)

    this.viewFinder.addEventListener('mousedown', this.handleViewFinderMousedown.bind(this))

    this.fullscreenButton = shadowRoot.getElementById('sm-fullscreen-button')
    let wrapper = this.parentElement
    fullscreen(this.fullscreenButton, wrapper, this)

    window.addEventListener('deviceorientation', this.handleWindowResize.bind(this))
    let handleWindowResizeDebounced = debounce(this.handleWindowResize, 100, false).bind(this)
    window.addEventListener('resize', handleWindowResizeDebounced)
  }

  // Fires when an instance was inserted into the document.
  connectedCallback () {
    this.render()
  }

  static get observedAttributes () {
    return [
      'zoom',
      'offset-x',
      'offset-y',
      'width',
      'height',
      'fill'
    ]
  }

  // Fires when an attribute was added, removed, or updated.
  attributeChangedCallback (attrName, oldVal, newVal) {
    // console.log('attributeChangedCallback', attrName, oldVal, newVal)
    if (oldVal !== newVal) {
      this[attrName] = newVal
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
    const zoom = Number(this.zoom !== undefined ? this.zoom : this.getAttribute('zoom'))
    // Set the initial scale so the slab best fills the width of its container.
    let parentWidth = this.parentNode.offsetWidth
    let parentHeight = this.parentNode.offsetHeight
    const isWideContainer = parentWidth > parentHeight
    const isWideSlab = this.width > this.height

    if (this.fill === 'contain') {
      if (((parentWidth / this.width) * this.height) > parentHeight) {
        this.scale = (parentHeight / this.height)
      } else {
        this.scale = (parentWidth / this.width)
      }
    } else { // fill = cover
      // scale the slab so it completely covers the container with excess overflowing
      if ((isWideContainer && isWideSlab) || (!isWideContainer && !isWideSlab)) {
        // Both the container and slab are similar aspect ratio; scale by ...
        this.scale = Math.max(parentHeight, parentWidth) / Math.max(this.height, this.width)
      } else if (isWideContainer && !isWideSlab) {
        this.scale = Math.max(parentHeight, parentWidth) / this.width
      } else if (!isWideContainer && isWideSlab) {
        this.scale = Math.max(parentHeight, parentWidth) / this.height
      }
    }

    if (zoom === 0) {
      // Zoom in to the max
      this.zoom = maximumScale / this.scale
      this.attributeChangedCallback('zoom', '0', this.zoom)
    }

    // Prevent overflowing when resizing
    this.style.width =
      this.slab.style.width =
      this.container.style.width =
      parentWidth + 'px'
    this.style.height =
      this.slab.style.height =
      this.container.style.height =
      parentHeight + 'px'

    if ((isWideContainer && isWideSlab) || (!isWideContainer && !isWideSlab)) {
      // Both the container and slab are both wide or both narrow; scale by largest dimension
      this.viewFinder.scale = viewFinderMax / Math.max(this.height, this.width)
    } else if (isWideContainer && !isWideSlab) {
      this.viewFinder.scale = viewFinderMax / this.width
    } else if (!isWideContainer && isWideSlab) {
      this.viewFinder.scale = viewFinderMax / this.height
    }

    let viewFinderBoxWidth = 0
    let viewFinderBoxHeight = 0
    let viewFinderWidth = this.width * this.viewFinder.scale
    let viewFinderHeight = this.height * this.viewFinder.scale

    if (isWideContainer && isWideSlab) {
      // both wide
      viewFinderBoxWidth = viewFinderMax
      viewFinderBoxHeight = (parentHeight / parentWidth) * viewFinderMax
    } else if (!isWideContainer && !isWideSlab) {
      // both narrow
      viewFinderBoxWidth = (parentWidth / parentHeight) * viewFinderMax
      viewFinderBoxHeight = viewFinderMax
    } else if (isWideContainer) {
      // wide container and narrow slab
      viewFinderBoxWidth = viewFinderMax
      viewFinderBoxHeight = (parentHeight / parentWidth) * viewFinderMax
    } else if (isWideSlab) {
      // narrow container and wide slab
      viewFinderBoxWidth = (parentWidth / parentHeight) * viewFinderMax
      viewFinderBoxHeight = viewFinderMax
    }

    // Match aspect ratio of slab
    this.viewFinder.style.width = Math.floor(viewFinderWidth) + 'px'
    this.viewFinder.style.height = Math.floor(viewFinderHeight) + 'px'

    // Match aspect ratio of container
    this.viewFinderBox.style.width = Math.floor(viewFinderBoxWidth) + 'px'
    this.viewFinderBox.style.height = Math.floor(viewFinderBoxHeight) + 'px'

    this._slot.style.width = this.width + 'px'
    this._slot.style.height = this.height + 'px'
    this.renderZoom()
    this.renderSlotPosition()
  }

  renderZoom () {
    // Disable zoom in button to prevent zooming in past the maximumScale
    if (maximumScale / this.scale === this.zoom) {
      this.zoomInEl.setAttribute('disabled', true)
    } else if (this.zoomInEl.hasAttribute('disabled')) {
      this.zoomInEl.removeAttribute('disabled')
    }

    // Prevent zooming out past 1
    if (this.zoom <= 1) {
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
    const isFullscreen = document.mozFullScreenElement || document.fullscreenElement || document.webkitFullscreenElement
    // The offset may be wrong if in fullscreen
    const offsetTop = isFullscreen ? 0 : this.offsetTop
    const offsetLeft = isFullscreen ? 0 : this.offsetLeft
    if (this.scrollAnimation) {
      this.scrollAnimation.stop()
      this.scrollAnimation = null
    }
    this.viewFinder.x = pageX
    this.viewFinder.y = pageY
    // position the viewFinder box to the center of the click
    let x = pageX - (this.viewFinder.offsetLeft + offsetLeft)
    let y = pageY - (this.viewFinder.offsetTop + offsetTop)
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

  handleWindowResize (ev) {
    const isFullscreen = document.mozFullScreenElement || document.fullscreenElement || document.webkitFullscreenElement
    if (isFullscreen) {
      this.fill = 'cover'
    } else {
      this.fill = this.getAttribute('fill')
    }
    this.render()
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
    this.zoom = zoom
    // skip animating the scrollTo since the slab is also being zoomed
    this.scrollTo(x, y, false)
  }

  zoomOut () {
    const x = Math.max((Number(this.offsetX) / 2) - (this.offsetWidth / 4), 0)
    const y = Math.max((Number(this.offsetY) / 2) - (this.offsetHeight / 4), 0)
    const zoom = Math.max(this.zoom / 2, 1.0)
    this.setAttribute('zoom', zoom)
    this.zoom = zoom
    // skip animating the scrollTo since the slab is also being zoomed
    this.scrollTo(x, y, false)
  }

  toggle () {
    this.flags.isMinimized = !this.flags.isMinimized
    this.slab.classList.toggle('is-minimized', this.flags.isMinimized)
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

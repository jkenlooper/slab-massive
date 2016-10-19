/* global HTMLElement, Hammer */
const duration = 300

class ScrollAnimation {
  constructor (element, x, y) {
    this.start = null
    this.element = element
    this.startX = element.scrollLeft
    this.startY = element.scrollTop
    this.distX = x - this.startX
    this.distY = y - this.startY
    this.animateID = window.requestAnimationFrame(this.step.bind(this))
  }

  step (timestamp) {
    if (!this.start) {
      this.start = timestamp
    }
    let progress = timestamp - this.start

    let scrollLeft = Math.round(this.startX + (Math.min((progress / duration), 1) * this.distX))
    let scrollTop = Math.round(this.startY + (Math.min((progress / duration), 1) * this.distY))
    this.element.scrollLeft = scrollLeft
    this.element.scrollTop = scrollTop
    if (progress < duration) {
      this.animateID = window.requestAnimationFrame(this.step.bind(this))
    }
  }

  stop () {
    window.cancelAnimationFrame(this.animateID)
  }
}

const style = `
:host {
  display: block;
  contain: content;
}

* {
  box-sizing: border-box;
}

.sm-Slab {
  position: relative;
  overflow: hidden;
}

/* All child elements are absolute position except the
 * -container. */
.sm-Slab > * {
  position: absolute;
  z-index: 2;
}

/* The scrollable element */
.sm-Slab-container {
  user-select: none;
  position: relative;
  z-index: 1;
  overflow: scroll;
}

/* Prevent the scrolling from going out of bounds */
.sm-Slab-slotWrapper {
  overflow: hidden;
}

/* Surrounds the actual 'slot' element and is what gets scaled
 * when doing zoom. */
.sm-Slab-slot {
  transform-origin: 0 0;
  outline: 1px solid red;
}
.sm-Slab-slot.is-animating {
  transition: transform 500ms linear;
}

.sm-Slab-zoomControls {
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
}

.sm-Slab-zoomIn,
.sm-Slab-zoomOut {
  display: block;
  margin: 10px;
  width: 30px;
  height: 30px;
  text-align: center;
}

.sm-ViewFinder {
  top: 5%;
  left: 5%;
  cursor: crosshair;
  outline: 1px solid black;
  background-color: rgba(255, 255, 255, 0.4);
}

.sm-ViewFinder.is-zoom1 {
  display: none;
}

.sm-ViewFinder-box {
  transform: translate3d(0px, 0px, 0);
  transform-origin: 0 0;
  transition: transform 300ms linear;
  cursor: crosshair;
  border: 1px solid red;
  width: 30px;
  height: 30px;
}

.sm-ViewFinder-box.is-dragging {
  transition: transform 0ms linear;
  background-color: rgba(0, 0, 0, 0.2);
}
`
const template = `
<div class="sm-Slab">
  <div class="sm-ViewFinder">
    <!--
    <slot id="view-finder" name="view-finder">
    </slot>
    -->
    <div class="sm-ViewFinder-box"></div>
  </div>
  <div class="sm-Slab-container"
     unselectable="on"
     onselectstart="return false;"
     onmousedown="return false;">
    <div class="sm-Slab-slotWrapper">
    <div class="sm-Slab-slot">
      <slot>
      </slot>
    </div>
    </div>
  </div>
  <div class="sm-Slab-zoomControls">
    <button class="sm-Slab-zoomIn" ng-click="PuzzleBoardController.zoomIn()">+</button>
    <button class="sm-Slab-zoomOut" ng-click="PuzzleBoardController.zoomOut()">-</button>
  </div>
</div>
`

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

    /*
    let mc = new Hammer.Manager(this.viewFinder, {})
    mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }))
    mc.add(new Hammer.Tap())
    mc.on('tap panstart panmove panend', Hammer.bindFn(this.viewFinderClick, this))
    */
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
    //console.log('attributeChangedCallback', attrName, oldVal, newVal)
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
    console.log('mousedown -> tap', ev.pageX, ev.pageY)
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

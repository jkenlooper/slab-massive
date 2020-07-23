const duration = 300;

class ScrollAnimation { // eslint-disable-line no-unused-vars
  constructor (element, x, y) {
    this.start = null;
    this.element = element;
    this.startX = element.scrollLeft;
    this.startY = element.scrollTop;
    this.distX = x - this.startX;
    this.distY = y - this.startY;
    this.animateID = window.requestAnimationFrame(this.step.bind(this));
  }

  step (timestamp) {
    if (!this.start) {
      this.start = timestamp;
    }
    let progress = timestamp - this.start;

    let scrollLeft = Math.round(this.startX + (Math.min((progress / duration), 1) * this.distX));
    let scrollTop = Math.round(this.startY + (Math.min((progress / duration), 1) * this.distY));
    this.element.scrollLeft = scrollLeft;
    this.element.scrollTop = scrollTop;
    if (progress < duration) {
      this.animateID = window.requestAnimationFrame(this.step.bind(this));
    }
  }

  stop () {
    window.cancelAnimationFrame(this.animateID);
  }
}

/* global Element */
function fullscreen (button, element) {
  function toggleFullScreen () {
    if (!document.mozFullScreenElement && !document.fullscreenElement && !document.webkitFullscreenElement) {
      if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else {
        document.webkitExitFullscreen();
      }
    }
  }

  button.addEventListener('click', function (e) {
    toggleFullScreen();
  }, false);

  // No public methods for now
  return {
  }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce (func, wait, immediate) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  }
}

var style = ":host{display:block;contain:content}*{box-sizing:border-box}.sm-Slab{position:relative;overflow:hidden}.sm-Slab>*{position:absolute;z-index:2}.sm-Slab-container{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;position:relative;z-index:1;overflow:scroll}.sm-Slab-slotWrapper{overflow:hidden}.sm-Slab-slot{transform-origin:0 0;outline:1px solid red}.sm-Slab-slot.is-animating{transition:transform .5s linear}.sm-Slab-zoomControls{display:flex;top:0;left:0;border-bottom:4px ridge hsla(0,0%,100%,.5);height:34px}.sm-Slab.is-minimized .sm-Slab-zoomControls{visibility:hidden}.sm-Slab-zoomControls>*+*{margin-left:5px}.sm-Slab-button{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:block;cursor:pointer;margin-top:5px;outline:0;border:1px solid hsla(0,0%,100%,.6);border-bottom:0;border-radius:35% 35% 0 0;background:rgba(0,0,0,.2);padding:0 .4em .2em;height:25px;color:hsla(0,0%,100%,.6);font-size:20px;font-weight:900;line-height:1.2em}.sm-Slab-button:disabled{opacity:.5;cursor:default}.sm-Slab-button--toggle{margin-top:0;margin-bottom:5px;border-top:0;border-bottom:1px solid hsla(0,0%,100%,.6);border-radius:0 0 35% 35%}.sm-Slab.is-minimized .sm-Slab-button--toggle{visibility:visible;opacity:.5}.sm-Slab-buttonText{display:inline-block;transition:transform .3s}.sm-Slab-button--toggle .sm-Slab-buttonText{transform:scaleY(-1)}.sm-Slab.is-minimized .sm-Slab-button--toggle .sm-Slab-buttonText{transform:scaleY(1)}.sm-ViewFinder{top:30px;left:0;cursor:crosshair}.sm-Slab.is-minimized .sm-ViewFinder{display:none}.sm-ViewFinder:after,.sm-ViewFinder:before{position:absolute;opacity:.5;width:20%;height:20%;content:\"\"}.sm-ViewFinder:before{top:0;left:0;border-left:4px ridge #fff}.sm-ViewFinder:after{right:0;bottom:0;border-right:4px ridge #fff;border-bottom:4px ridge #fff}.sm-ViewFinder-box{transform:translateZ(0);transform-origin:0 0;opacity:.5;transition:transform .3s linear;cursor:crosshair;border:1px dashed #000;background-color:hsla(0,0%,100%,.4);width:30px;height:30px}";

var template = "<div id=sm-slab class=sm-Slab> <div id=sm-viewfinder class=sm-ViewFinder> <slot id=view-finder name=view-finder> </slot> <div id=sm-viewfinderbox class=sm-ViewFinder-box></div> </div> <div id=sm-container class=sm-Slab-container unselectable=on onselectstart=return!1 onmousedown=return!1> <div id=sm-slotwrapper class=sm-Slab-slotWrapper> <div id=sm-slot class=sm-Slab-slot> <slot> </slot> </div> </div> </div> <div class=sm-Slab-zoomControls> <button id=sm-zoomin-button class=sm-Slab-button> <span class=sm-Slab-buttonText> + </span> </button> <button id=sm-zoomout-button class=sm-Slab-button> <span class=sm-Slab-buttonText> - </span> </button> <button id=sm-fullscreen-button class=sm-Slab-button> <span class=sm-Slab-buttonText> &harr; </span> </button> <button id=sm-toggle-button class=\"sm-Slab-button sm-Slab-button--toggle\"> <span class=sm-Slab-buttonText> &#9650; </span> </button> </div> </div> ";

var version = "0.4.0";
var description = "Web Component for displaying and navigating partial content";
var repository = {
	type: "git",
	url: "https://github.com/jkenlooper/slab-massive"
};
var author = "Jake Hickenlooper";

/* global HTMLElement */
const html = `
<!--
Slab Massive ${version}
${description}
${author}
${repository.url}
-->
<style>${style}</style>
${template}
`;
const viewFinderMax = 150;
const maximumScale = 1;

const tag = 'slab-massive';

window.customElements.define(tag, class SlabMassive extends HTMLElement {
  constructor () {
    super();
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = html;

    this.flags = {
      isMinimized: false
    };

    this.slab = shadowRoot.getElementById('sm-slab');
    this.container = shadowRoot.getElementById('sm-container');
    this._slot = shadowRoot.getElementById('sm-slot');
    this.slotWrapper = shadowRoot.getElementById('sm-slotwrapper');
    this.viewFinder = shadowRoot.getElementById('sm-viewfinder');
    this.viewFinderBox = shadowRoot.getElementById('sm-viewfinderbox');
    this.viewFinder.x = (this.viewFinder.offsetLeft + this.offsetLeft);
    this.viewFinder.y = (this.viewFinder.offsetTop + this.offsetTop);

    this.zoomInEl = shadowRoot.getElementById('sm-zoomin-button');
    let zoomIn = this.zoomIn.bind(this);
    this.zoomInEl.addEventListener('click', zoomIn);
    this.zoomOutEl = shadowRoot.getElementById('sm-zoomout-button');
    let zoomOut = this.zoomOut.bind(this);
    this.zoomOutEl.addEventListener('click', zoomOut);
    this.toggleEl = shadowRoot.getElementById('sm-toggle-button');
    this.toggleEl.addEventListener('click', this.toggle.bind(this));

    let handleScroll = this.handleScroll.bind(this);
    this.container.addEventListener('scroll', handleScroll);

    this.viewFinder.addEventListener('mousedown', this.handleViewFinderMousedown.bind(this));

    this.fullscreenButton = shadowRoot.getElementById('sm-fullscreen-button');
    let wrapper = this.parentElement;
    fullscreen(this.fullscreenButton, wrapper);

    window.addEventListener('deviceorientation', this.handleWindowResize.bind(this));
    let handleWindowResizeDebounced = debounce(this.handleWindowResize, 100, false).bind(this);
    window.addEventListener('resize', handleWindowResizeDebounced);
  }

  // Fires when an instance was inserted into the document.
  connectedCallback () {
    this.render();
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
      this[attrName] = newVal;
      switch (attrName) {
        case 'zoom':
          this.renderZoom();
          this.renderSlotPosition();
          break
        case 'offset-x':
          this.renderSlotPosition();
          break
        case 'offset-y':
          this.renderSlotPosition();
          break
        case 'width':
          this.render();
          break
        case 'height':
          this.render();
          break
        case 'fill':
          this.render();
          break
      }
    }
  }

  render () {
    const zoom = Number(this.zoom !== undefined ? this.zoom : this.getAttribute('zoom'));
    // Set the initial scale so the slab best fills the width of its container.
    let parentWidth = this.parentNode.offsetWidth;
    let parentHeight = this.parentNode.offsetHeight;
    const isWideContainer = parentWidth > parentHeight;
    const isWideSlab = this.width > this.height;

    if (this.fill === 'contain') {
      if (((parentWidth / this.width) * this.height) > parentHeight) {
        this.scale = (parentHeight / this.height);
      } else {
        this.scale = (parentWidth / this.width);
      }
    } else { // fill = cover
      // scale the slab so it completely covers the container with excess overflowing
      if ((isWideContainer && isWideSlab) || (!isWideContainer && !isWideSlab)) {
        // Both the container and slab are similar aspect ratio; scale by ...
        this.scale = Math.max(parentHeight, parentWidth) / Math.max(this.height, this.width);
      } else if (isWideContainer && !isWideSlab) {
        this.scale = Math.max(parentHeight, parentWidth) / this.width;
      } else if (!isWideContainer && isWideSlab) {
        this.scale = Math.max(parentHeight, parentWidth) / this.height;
      }
    }

    if (zoom === 0) {
      // Zoom in to the max
      this.zoom = maximumScale / this.scale;
      this.attributeChangedCallback('zoom', '0', this.zoom);
    }

    // Prevent overflowing when resizing
    this.style.width =
      this.slab.style.width =
      this.container.style.width =
      parentWidth + 'px';
    this.style.height =
      this.slab.style.height =
      this.container.style.height =
      parentHeight + 'px';

    if ((isWideContainer && isWideSlab) || (!isWideContainer && !isWideSlab)) {
      // Both the container and slab are both wide or both narrow; scale by largest dimension
      this.viewFinder.scale = viewFinderMax / Math.max(this.height, this.width);
    } else if (isWideContainer && !isWideSlab) {
      this.viewFinder.scale = viewFinderMax / this.width;
    } else if (!isWideContainer && isWideSlab) {
      this.viewFinder.scale = viewFinderMax / this.height;
    }

    let viewFinderBoxWidth = 0;
    let viewFinderBoxHeight = 0;
    let viewFinderWidth = this.width * this.viewFinder.scale;
    let viewFinderHeight = this.height * this.viewFinder.scale;

    if (isWideContainer && isWideSlab) {
      // both wide
      viewFinderBoxWidth = viewFinderMax;
      viewFinderBoxHeight = (parentHeight / parentWidth) * viewFinderMax;
    } else if (!isWideContainer && !isWideSlab) {
      // both narrow
      viewFinderBoxWidth = (parentWidth / parentHeight) * viewFinderMax;
      viewFinderBoxHeight = viewFinderMax;
    } else if (isWideContainer) {
      // wide container and narrow slab
      viewFinderBoxWidth = viewFinderMax;
      viewFinderBoxHeight = (parentHeight / parentWidth) * viewFinderMax;
    } else if (isWideSlab) {
      // narrow container and wide slab
      viewFinderBoxWidth = (parentWidth / parentHeight) * viewFinderMax;
      viewFinderBoxHeight = viewFinderMax;
    }

    // Match aspect ratio of slab
    this.viewFinder.style.width = Math.floor(viewFinderWidth) + 'px';
    this.viewFinder.style.height = Math.floor(viewFinderHeight) + 'px';

    // Match aspect ratio of container
    this.viewFinderBox.style.width = Math.floor(viewFinderBoxWidth) + 'px';
    this.viewFinderBox.style.height = Math.floor(viewFinderBoxHeight) + 'px';

    this._slot.style.width = this.width + 'px';
    this._slot.style.height = this.height + 'px';
    this.renderZoom();
    this.renderSlotPosition();
  }

  renderZoom () {
    // Disable zoom in button to prevent zooming in past the maximumScale
    if (maximumScale / this.scale === this.zoom) {
      this.zoomInEl.setAttribute('disabled', true);
    } else if (this.zoomInEl.hasAttribute('disabled')) {
      this.zoomInEl.removeAttribute('disabled');
    }

    // Prevent zooming out past 1
    if (this.zoom <= 1) {
      this.zoomOutEl.setAttribute('disabled', true);
    } else if (this.zoomOutEl.hasAttribute('disabled')) {
      this.zoomOutEl.removeAttribute('disabled');
    }
  }

  renderSlotPosition () {
    this.slotWrapper.style.width = ((this.width * this.scale) * this.zoom) + 'px';
    this.slotWrapper.style.height = ((this.height * this.scale) * this.zoom) + 'px';
    this._slot.style.transform = `scale(${this.scale * this.zoom})`;

    // Update the viewFinder box position and size
    this.viewFinderBox.style.transform = `translate3d(${Math.floor(((this.offsetX * this.viewFinder.scale) / this.scale) / this.zoom)}px, ${Math.floor(((this.offsetY * this.viewFinder.scale) / this.scale) / this.zoom)}px, 0) scale(${1 / this.zoom})`;
    this.viewFinderBox.style.borderWidth = this.zoom + 'px';
  }

  moveBy (x, y) {
    this.pageToOffset(this.viewFinder.startX + x, this.viewFinder.startY + y);
  }
  scrollTo (scrollLeft, scrollTop, animate) {
    if (this.scrollAnimation) {
      this.scrollAnimation.stop();
      this.scrollAnimation = null;
    }
    if (animate) {
      this._slot.classList.add('is-animating');
      this.scrollAnimation = new ScrollAnimation(this.container, scrollLeft, scrollTop);
    } else {
      this._slot.classList.remove('is-animating');
      this.container.scrollLeft = scrollLeft;
      this.container.scrollTop = scrollTop;
    }
  }

  pageToOffset (pageX, pageY, animate) {
    const isFullscreen = document.mozFullScreenElement || document.fullscreenElement || document.webkitFullscreenElement;
    // The offset may be wrong if in fullscreen
    const offsetTop = isFullscreen ? 0 : this.offsetTop;
    const offsetLeft = isFullscreen ? 0 : this.offsetLeft;
    if (this.scrollAnimation) {
      this.scrollAnimation.stop();
      this.scrollAnimation = null;
    }
    this.viewFinder.x = pageX;
    this.viewFinder.y = pageY;
    // position the viewFinder box to the center of the click
    let x = pageX - (this.viewFinder.offsetLeft + offsetLeft);
    let y = pageY - (this.viewFinder.offsetTop + offsetTop);
    // Trigger the scroll event for the container which will update the offsetX and offsetY.
    let scrollLeft = ((x / this.viewFinder.scale) * this.scale) * this.zoom;
    let scrollTop = ((y / this.viewFinder.scale) * this.scale) * this.zoom;
    if (animate) {
      this._slot.classList.add('is-animating');
      this.scrollAnimation = new ScrollAnimation(this.container, scrollLeft, scrollTop);
    } else {
      this._slot.classList.remove('is-animating');
      this.container.scrollLeft = scrollLeft;
      this.container.scrollTop = scrollTop;
    }
  }

  handleScroll (ev) {
    let x = (this.container.scrollLeft * this.viewFinder.scale);
    let y = (this.container.scrollTop * this.viewFinder.scale);
    this.offsetX = (x / this.viewFinder.scale);
    this.offsetY = (y / this.viewFinder.scale);
  }

  handleWindowResize (ev) {
    const isFullscreen = document.mozFullScreenElement || document.fullscreenElement || document.webkitFullscreenElement;
    if (isFullscreen) {
      this.fill = 'cover';
    } else {
      this.fill = this.getAttribute('fill');
    }
    this.render();
  }

  handleViewFinderMousedown (ev) {
    this.viewFinderClick({
      type: 'tap',
      pageX: ev.pageX,
      pageY: ev.pageY
    });
  }

  viewFinderClick (ev) {
    // Position the click to the center of the viewFinderBox
    const x = ev.pageX - (this.viewFinderBox.offsetWidth / this.zoom) / 2;
    const y = ev.pageY - (this.viewFinderBox.offsetHeight / this.zoom) / 2;
    switch (ev.type) {
      case 'tap':
        this.pageToOffset(x, y, true);
        break
      // TODO: Only tap is supported for now
      case 'panstart':
        this.viewFinderBox.classList.add('is-dragging');
        this.viewFinder.x = this.viewFinder.startX = x;
        this.viewFinder.y = this.viewFinder.startY = y;
        break
      case 'panmove':
        // Drag the element
        this.moveBy(ev.deltaX, ev.deltaY);
        break
      case 'panend':
        // Save the new position
        this.viewFinderBox.classList.remove('is-dragging');
        this.moveBy(ev.deltaX, ev.deltaY);
        break
    }
  }

  zoomIn () {
    const x = (Number(this.offsetX) * 2) + ((this.offsetWidth / 4) * 2);
    const y = (Number(this.offsetY) * 2) + ((this.offsetHeight / 4) * 2);
    const zoom = Math.min(maximumScale / this.scale, this.zoom * 2);
    this.setAttribute('zoom', zoom);
    this.zoom = zoom;
    // skip animating the scrollTo since the slab is also being zoomed
    this.scrollTo(x, y, false);
  }

  zoomOut () {
    const x = Math.max((Number(this.offsetX) / 2) - (this.offsetWidth / 4), 0);
    const y = Math.max((Number(this.offsetY) / 2) - (this.offsetHeight / 4), 0);
    const zoom = Math.max(this.zoom / 2, 1.0);
    this.setAttribute('zoom', zoom);
    this.zoom = zoom;
    // skip animating the scrollTo since the slab is also being zoomed
    this.scrollTo(x, y, false);
  }

  toggle () {
    this.flags.isMinimized = !this.flags.isMinimized;
    this.slab.classList.toggle('is-minimized', this.flags.isMinimized);
  }

  // Reflect the prop with the attr
  get offsetX () {
    return this.getAttribute('offset-x')
  }
  set offsetX (val) {
    this.setAttribute('offset-x', val);
  }

  get offsetY () {
    return this.getAttribute('offset-y')
  }
  set offsetY (val) {
    this.setAttribute('offset-y', val);
  }

  get width () {
    return this.getAttribute('width')
  }
  set width (val) {
    if (val !== this.width) { this.setAttribute('width', val); }
  }

  get height () {
    return this.getAttribute('height')
  }
  set height (val) {
    if (val !== this.height) { this.setAttribute('height', val); }
  }

  get fill () {
    return this.getAttribute('fill')
  }
  set fill (val) {
    if (val !== this.fill) { this.setAttribute('fill', val); }
  }
});

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

export default ScrollAnimation

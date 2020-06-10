import { TOOLTYPES } from '../../const'


class STACKSCROLL {
  constructor(options) {
    this.toolType = TOOLTYPES.STACKSCROLL;
    this.active = false;
    this.visible = false;
    this.points = null;
  }
  render (e) {

  }
  tap (e) {

  }
  touchdown (e) {
    const { info: { clientY } } = e;
    this.points = {
      y: clientY
    }
  }
  touchmove (e) {
    const { info: { viewport, clientY } } = e;
    let stepY = clientY - this.points.y;
    this.points = {
      y: clientY
    }
    let { showIndex } = viewport;
    showIndex = showIndex + stepY / 2;
    viewport.showImage(Math.round(showIndex))
  }
}

export default STACKSCROLL;
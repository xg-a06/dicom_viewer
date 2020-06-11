import { TOOLTYPES } from '../../const'


class WWWC {
  constructor(options) {
    this.toolType = TOOLTYPES.WWWC;
    this.active = false;
    this.visible = false;
    this.points = null;
  }
  render (e) {

  }
  tap (e) {

  }
  touchdown (e) {

    const { info: { clientX, clientY } } = e;
    this.points = {
      x: clientX,
      y: clientY
    }
  }
  touchmove (e) {
    const { info: { viewport, clientX, clientY } } = e;
    let stepX = clientX - this.points.x;
    let stepY = clientY - this.points.y;
    this.points = {
      x: clientX,
      y: clientY
    }
    const { wwwc } = viewport.displayState;
    wwwc.ww = wwwc.ww + stepX;
    wwwc.wc = wwwc.wc + stepY;
    viewport.update();
  }
}

export default WWWC;
import { TOOLTYPES } from '../../const'


class MOVE {
  constructor(options) {
    this.toolType = TOOLTYPES.MOVE;
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
    const { center } = viewport.displayState;
    center.x = center.x + stepX;
    center.y = center.y + stepY;
    viewport.update();
  }
}

export default MOVE;
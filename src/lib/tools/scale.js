import { TOOL_TYPES } from '../../const'


class SCALE {
  constructor(options) {
    this.toolType = TOOL_TYPES.SCALE;
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
    const { info: { viewport, clientY } } = e;
    let stepY = clientY - this.points.y;
    this.points = {
      y: clientY
    }
    let { scale } = viewport.displayState;
    scale = scale + stepY / 200;
    if (scale < 0.25) {
      scale = 0.25
    } else if (scale > 10) {
      scale = 10;
    }
    viewport.displayState.scale = scale;
    viewport.update();
  }
}

export default SCALE;
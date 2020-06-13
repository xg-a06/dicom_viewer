import { TOOL_TYPES } from '../../const'


class SCALE {
  constructor(options) {
    this.toolType = TOOL_TYPES.SCALE;
    this.active = false;
    this.visible = false;
    this.points = null;
    this.scale = null;
  }
  render (e) {

  }
  tap (e) {

  }
  minStep (t, v) {
    if (t > 2 && v > 0 && v < 0.5) {
      v = 0.5
    }
    return v;
  }
  touchdown (e) {
    const { info: { clientY }, pinchScale } = e;
    this.points = {
      y: clientY
    }
    this.scale = pinchScale;
  }
  touchmove (e) {

    let { info: { viewport, clientY }, pinchScale: scale } = e;
    let { scale: tmpScale } = viewport.displayState;

    if (scale) {
      // fix hammer pinchin
      tmpScale = tmpScale - this.minStep(tmpScale, this.scale - scale);
      this.scale = scale;
    } else {
      let stepY = clientY - this.points.y;
      this.points = {
        y: clientY
      }
      tmpScale = tmpScale + stepY / 200;
    }

    if (tmpScale < 0.25) {
      tmpScale = 0.25
    } else if (tmpScale > 8) {
      tmpScale = 8;
    }

    viewport.displayState.scale = tmpScale;
    viewport.update();
  }
}

export default SCALE;
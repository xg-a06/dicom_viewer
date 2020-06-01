import { WWWC } from '../../const'
import { throttle } from '../../utils/tools';

class DisplayStateManager {
  constructor(viewport) {
    this.center = {
      x: 0, y: 0
    };
    this.scale = 1;
    this.wwwc = {
      ww: WWWC.LUNG.ww,
      wc: WWWC.LUNG.wc
    };
    this.area = {
      x: 0,
      y: 0,
      widht: 0,
      height: 0
    }
    this.viewport = viewport;
    this.initEvent();
  }
  touchmoveCallback = throttle((e) => {
    console.log('trigger', e.touches[0].clientX, e.touches[0].clientY);
  }, 100);

  initEvent () {
    let { canvas } = this.viewport;
    canvas.addEventListener('touchmove', this.touchmoveCallback)
  }
}

export default DisplayStateManager;
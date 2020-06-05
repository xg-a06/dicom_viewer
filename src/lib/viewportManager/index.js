import Loader from '../loader/index'
import Viewport from '../viewport/index'
import { EVENTS, LAYOUT } from '../../const';
import EventEmitter from '../../utils/event';
import { debounce } from '../../utils/tools';
import doLayout from './layouts';

const baseOptions = {

}
class ViewportManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = Object.assign({}, baseOptions, options);
    this.elm = this.config.elm;

    this.loader = new Loader({ manager: this });
    this.toolsManager = null;
    this.layout = null;
    this.viewports = [];
    this.divs = [];
    this.currentViewportId = null;

    this.init();
  }

  resizeCallback = debounce((e) => {
    this.emit(EVENTS.RESIZE, e);
  }, 150);

  init () {
    this.initResize();
    this.changeLayout();
  }
  initResize () {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `position: absolute;top: 0;left: 0;width: 100%;height: 100%;border: 0;`;
    this.elm.style.position = 'relative';
    this.elm.style.overflow = 'hidden';
    this.elm.insertBefore(iframe, this.elm.firstChild);
    iframe.contentWindow.onresize = (e) => {
      this.resizeCallback(e);
    };
    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = `position: absolute;top: 0;left: 0;width: 100%;height: 100%;`;
    this.elm.appendChild(this.wrapper);
  }
  changeLayout (layoutType = LAYOUT.L1x1, cloneViewportId) {
    this.layout = layoutType;
    this.divs = doLayout(layoutType);
    this.wrapper.innerHTML = null;
    this.divs.forEach((div, index) => {
      this.wrapper.appendChild(div);
      let viewport = this.viewports[index];
      if (viewport) {
        viewport.setWrapper(div);
      }
      else if (!viewport && cloneViewportId) {
        const cloneViewport = this.viewports.find(v => v.id === cloneViewportId);
        this.addViewport({
          seriesId: cloneViewport.seriesId,
          elm: div
        })
      }
    })
  }
  addTask ({
    seriesId,
    imageUrls
  }) {
    let { loader } = this;
    loader.alloc(seriesId, imageUrls.length);
    loader.addTask({
      seriesId,
      imageUrls
    })
  }
  addViewport ({ seriesId, elm = this.divs[0] }) {
    const viewport = new Viewport({
      elm,
      seriesId,
      manager: this
    })
    viewport.setSeries({
      seriesId
    });
    this.viewports.push(viewport);
    return viewport;
  }
}

export default ViewportManager;
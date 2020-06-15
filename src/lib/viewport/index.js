import { EVENTS, TX_EVENTS, WWWC } from '../../const'
import { getVoiLUTData } from './lut'
import attachEvent from './event'

const baseOptions = {

}

class Viewer {
  constructor(options = {}) {
    this.config = Object.assign({}, baseOptions, options);
    this.manager = this.config.manager;

    this.id = Math.ceil(Math.random() * 10000);
    this.studyId = null;
    this.seriesId = null;
    this.length = null;

    this.image = null;
    this.currentIndex = -1;
    this.showIndex = 0;
    this.renderCanvas = null;
    this.canvas = null;
    this.elm = this.config.elm;
    this.timerId = null;
    this.isRunning = false;

    this.displayState = {
      area: {
        x: 0, y: 0, width: 0, height: 0
      },
      center: null,
      scale: 1,
      ratio: 0,
      rotate: 0,
      invert: false,
      wwwc: {
        ww: WWWC.LUNG.ww,
        wc: WWWC.LUNG.wc
      }
    }

    this.init()
  }

  calDisplayArea () {
    const { displayState } = this;
    const { width, height } = this.getElmSize();
    let w = 0; let h = 0;
    if (width > height) {
      w = h = height;
    } else {
      w = h = width;
    }
    if (!displayState.center) {
      displayState.center = { x: width / 2, y: height / 2 };
    }
    let { center, scale } = displayState;
    displayState.area = {
      x: center.x - w * scale / 2,
      y: center.y - h * scale / 2,
      width: w * scale,
      height: h * scale
    }
    displayState.ratio = w * scale / 512
  }
  getElmSize () {
    let { clientWidth, clientHeight } = this.elm;
    return { width: clientWidth, height: clientHeight };
  }
  init () {
    this.initCanvas();
    this.initEvent();
  }
  initCanvas () {
    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = 512;
    renderCanvas.height = 512;
    this.renderCanvas = renderCanvas;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'relative';
    canvas.style.display = 'block';
    canvas.style.zIndex = '1';
    this.canvas = canvas;
    this.elm.appendChild(canvas);
    attachEvent(this);
  }
  initEvent () {
    this.manager.on(EVENTS.LOADED, ({ seriesId, index, image, count }) => {
      let { showIndex, currentIndex } = this;
      if (showIndex !== currentIndex && showIndex === index) {
        this.currentIndex = showIndex;
        this.setImage(image)
      }
    })
    this.manager.on(EVENTS.RESIZE, (e) => {
      const { displayState } = this;
      const { width, height } = this.getElmSize();
      displayState.center = { x: width / 2, y: height / 2 };
      this.update();
    })
  }
  setWrapper (wrapper) {
    this.elm = wrapper;
    this.initCanvas();
    this.update();
  }
  setSeries ({ studyId, seriesId }) {
    let { showIndex, currentIndex } = this;
    let seriesCache = this.manager.loader.getSeriesCache(seriesId);
    let image = seriesCache[showIndex];
    this.studyId = studyId;
    this.seriesId = seriesId;
    this.length = seriesCache.length;
    if (showIndex !== currentIndex && image) {
      this.currentIndex = showIndex;
      this.setImage(image)
    }
  }
  showImage (index) {
    if (index < 0) {
      index = 0;
    } else if (index >= this.length) {
      index = this.length - 1;
    }
    this.showIndex = this.currentIndex = index;
    let seriesCache = this.manager.loader.getSeriesCache(this.seriesId);
    let image = seriesCache[index];
    if (image) {
      this.setImage(image)
    }
  }
  autoPlay () {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    this.timerId = setInterval(() => {
      let index = ++this.showIndex;
      if (index >= this.length) {
        index = 0;
      }
      this.showImage(index)
    }, 50); // 200 100 50 35 25
  }
  stopPlay () {
    this.isRunning = false;
    clearInterval(this.timerId)
  }
  setImage (image) {
    this.image = image;
    this.update();
  }
  getImageData () {
    let { image, renderCanvas, displayState: { wwwc } } = this;
    const pixelData = image.getPixelData();
    ({ ww: image.windowWidth, wc: image.windowCenter } = wwwc);
    const lut = getVoiLUTData(image);
    const { width, height } = renderCanvas;
    const ctx = renderCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    const renderCanvasData = ctx.getImageData(0, 0, width, height);

    let imageDataIndex = 3;
    let numPixels = 512 * 512;
    for (let i = 0; i < numPixels; i++) {
      renderCanvasData.data[imageDataIndex] = lut[pixelData[i] + (-image.minPixelValue)];
      imageDataIndex += 4;
    }
    ctx.putImageData(renderCanvasData, 0, 0);
  }
  update () {
    this.getImageData();
    this.draw();
  }
  draw () {
    const { renderCanvas, canvas } = this;
    let { width, height } = this.getElmSize();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    this.calDisplayArea();
    const { displayState: { area } } = this;
    ctx.drawImage(renderCanvas, 0, 0, 512, 512, area.x, area.y, area.width, area.height);
    ctx.restore();

    this.manager.emit(TX_EVENTS.RENDERED, {
      info: {
        el: canvas,
        viewport: this,
      }
    })
  }
}

export default Viewer




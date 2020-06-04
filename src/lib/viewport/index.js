import { LOADER_EVENT, WWWC } from '../../const'
import Loader from '../loader/index'
import { getVoiLUTData } from './lut'
import { debounce, throttle } from '../../utils/tools';

const baseOptions = {

}

class Viewer {
  constructor(options = {}) {
    this.config = Object.assign({}, baseOptions, options);
    this.loader = new Loader();

    this.studyId = this.config.studyId;
    this.seriesId = this.config.seriesId;
    this.length = this.config.imageUrls.length;
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
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      center: {
        x: null, y: null
      },
      scale: 1,
      ratio: 0,
      wwwc: {
        ww: WWWC.LUNG.ww,
        wc: WWWC.LUNG.wc
      }
    }

    this.totalElm = document.querySelector('#total');
    this.nowElm = document.querySelector('#now');
    this.currentElm = document.querySelector('#current');

    this.init()
  }
  resizeCallback = debounce(this.update, 150)
  moveCallback = throttle(this.calPoints, 100)
  calDisplayArea () {
    const { displayState } = this;
    const { width, height } = this.getElmSize();
    let w = 0; let h = 0;
    if (width > height) {
      w = h = height;
    } else {
      w = h = width;
    }
    if (displayState.center.x === null) {
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
  calPoints (e) {
    const { displayState: { area, ratio } } = this
    let { clientX, clientY } = e;
    let imageX = Math.round((clientX - area.x) / ratio)
    let imageY = Math.round((clientY - area.y) / ratio)
    console.log('image', imageX, imageY);
  }
  getElmSize () {
    let { clientWidth, clientHeight } = this.elm;
    return { width: clientWidth, height: clientHeight };
  }
  init () {
    this.initCanvas();
    this.initTask();
    this.initResize();

  }
  initResize () {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `position: absolute;top: 0;left: 0;width: 100%;height: 100%;border: 0;`;
    this.elm.style.position = 'relative';
    this.elm.style.overflow = 'hidden';
    this.elm.insertBefore(iframe, this.elm.firstChild);
    iframe.contentWindow.onresize = () => {
      this.resizeCallback();
    };
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

    this.canvas.addEventListener('mousemove', (e) => {
      this.moveCallback(e)
    })
  }
  initTask () {
    let { loader, seriesId, config: { imageUrls } } = this;
    this.totalElm.innerText = imageUrls.length;
    this.currentElm.innerText = this.showIndex + 1;
    loader.alloc(seriesId, imageUrls.length);
    loader.addTask({
      seriesId,
      imageUrls
    })
    loader.on(LOADER_EVENT.LOADED, ({ seriesId, index, image, count }) => {
      this.nowElm.innerText = count;
      let { showIndex, currentIndex } = this;
      if (showIndex !== currentIndex && showIndex === index) {
        this.currentIndex = showIndex;
        this.setImage(image)
      }
    })
  }

  autoPlay () {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    // this.loader.cacheManager[this.seriesId] = this.loader.cacheManager[this.seriesId].filter(i => i)
    this.timerId = setInterval(() => {
      let index = ++this.showIndex;
      this.currentIndex = index;
      if (index >= this.length) {
        this.showIndex = this.currentIndex = index = 0;
      }
      this.currentElm.innerText = index + 1;

      let image = this.loader.cacheManager[this.seriesId][index]
      if (image) {
        this.setImage(image)
      }
    }, 16);
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
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);


    // ctx.translate(width / 2, height / 2);
    this.calDisplayArea();
    const { displayState: { area } } = this;
    ctx.drawImage(renderCanvas, 0, 0, 512, 512, area.x, area.y, area.width, area.height);
    ctx.restore();
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

export default Viewer




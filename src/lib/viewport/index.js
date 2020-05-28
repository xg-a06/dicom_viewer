import { LOADER_EVENT } from '../../const'
import Loader from '../loader/index'
import { getVoiLUTData } from './lut'
import { debounce } from '../../utils/tools';
const baseOptions = {

}

class Viewer {
  constructor(options = {}) {
    this.config = Object.assign({}, baseOptions, options);
    this.loader = new Loader();

    this.studyId = this.config.studyId;
    this.seriesId = this.config.seriesId;
    this.currentIndex = -1;
    this.showIndex = 0;
    this.length = this.config.imageUrls.length;
    this.image = null;
    this.renderCanvas = null;
    this.canvas = null;
    this.elm = this.config.elm;
    this.timerId = null;
    this.isRunning = false;

    this.totalElm = document.querySelector('#total');
    this.nowElm = document.querySelector('#now');
    this.currentElm = document.querySelector('#current');


    this.init()
  }
  resizeCallback = debounce(this.update, 150)
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
    this.renderCanvas = renderCanvas;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'relative';
    canvas.style.display = 'block';
    canvas.style.zIndex = '1';
    this.canvas = canvas;
    this.elm.appendChild(canvas);
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
    let { image, renderCanvas } = this;
    const pixelData = image.getPixelData();
    const lut = getVoiLUTData(image);
    // let { width, height } = this.getElmSize();
    renderCanvas.width = 512;
    renderCanvas.height = 512;
    const ctx = renderCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 512, 512);
    const renderCanvasData = ctx.getImageData(0, 0, 512, 512);

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
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    let w = 0; let h = 0; let x = 0; let y = 0;
    if (width > height) {
      w = h = height;
      x = width / 2 - w / 2;
      y = 0;
    } else {
      w = h = width;
      x = 0;
      y = height / 2 - h / 2;
    }
    ctx.drawImage(renderCanvas, 0, 0, 512, 512, x, y, w, h);
  }
}

export default Viewer




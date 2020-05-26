const baseOptions = {

}

class Viewer {
  constructor(options = {}) {
    this.config = Object.assign({}, baseOptions, options)
    this.image = null;
    this.renderCanvas = null;
    this.canvas = null;
    this.elm = this.config.elm;
    this.states = [];
    this.init();
  }
  generateLinearVOILUT (windowWidth, windowCenter) {
    return (modalityLutValue) => {
      return ((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0;
    };
  }
  generateLinearModalityLUT (slope, intercept) {
    return (storedPixelValue) => storedPixelValue * slope + intercept;
  }
  getElmSize () {
    let { clientWidth, clientHeight } = this.elm;
    return { width: clientWidth, height: clientHeight };
  }
  init () {

    const renderCanvas = document.createElement('canvas');
    this.renderCanvas = renderCanvas;

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    this.canvas = canvas;
  }
  setImage (image) {
    this.image = image;
    this.update();
  }
  update () {

  }
  draw () {
    const { renderCanvas, canvas } = this;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 512, 512);
    ctx.drawImage(renderCanvas, 0, 0, 512, 512, 0, 0, 512, 512);
  }
}

export default Viewer
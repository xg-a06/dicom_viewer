import { sum, minus } from './module'
import dicomParser from "dicom-parser";
import ajax from './utils/ajax'


function generateLinearVOILUT (windowWidth = 1200, windowCenter = -600) {
  return function (modalityLutValue) {
    return ((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0;
  };
}

function generateLinearModalityLUT (slope, intercept) {
  return (storedPixelValue) => storedPixelValue * slope + intercept;
}

ajax({
  url: 'http://localhost:3333/1.2.840.113619.2.416.20795945767143795462432515614159920',
  responseType: 'arraybuffer'
}).then(({ code, data }) => {
  if (code === 200) {
    const response = new Uint8Array(data);
    const dataSet = dicomParser.parseDicom(response);

    const pixelDataElement =
      dataSet.elements.x7fe00010 || dataSet.elements.x7fe00008;
    // const bitsAllocated = dataSet.uint16('x00280100');
    const rows = dataSet.uint16('x00280010');
    const columns = dataSet.uint16('x00280011');
    const samplesPerPixel = dataSet.uint16('x00280002');

    const pixelDataOffset = pixelDataElement.dataOffset;
    const pixelsPerFrame = rows * columns * samplesPerPixel;

    let frameOffset = pixelDataOffset + 0 * pixelsPerFrame * 2;
    if (frameOffset >= dataSet.byteArray.length) {
      throw new Error('frame exceeds size of pixelData');
    }

    let pixelData = new Uint8Array(
      dataSet.byteArray.buffer,
      frameOffset,
      pixelsPerFrame * 2
    );
    let arrayBuffer = pixelData.buffer;
    arrayBuffer = arrayBuffer.slice(pixelData.byteOffset);
    pixelData = new Int16Array(arrayBuffer, 0, pixelData.length / 2);
    console.log('pixelData', pixelData);

    let maxPixelValue = 2893;
    let minPixelValue = -2000;
    let length = maxPixelValue - minPixelValue + 1;

    let mlutfn = generateLinearModalityLUT(1, -1024);
    let vlutfn = generateLinearVOILUT();
    let lut = new Uint8ClampedArray(4894);

    for (let i = 0; i < length; i++) {
      lut[i] = vlutfn(mlutfn(minPixelValue + i));
    }

    console.log('lut', lut);

    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = 512;
    renderCanvas.height = 512;
    const canvasContext = renderCanvas.getContext('2d');
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, 512, 512);
    const renderCanvasData = canvasContext.getImageData(0, 0, 512, 512);

    let imageDataIndex = 3;
    let numPixels = 512 * 512;
    for (let i = 0; i < numPixels; i++) {
      renderCanvasData.data[imageDataIndex] = lut[pixelData[i] + (-minPixelValue)];
      imageDataIndex += 4;
    }
    canvasContext.putImageData(renderCanvasData, 0, 0);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    canvas.style.display = 'block';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 512, 512);
    ctx.drawImage(renderCanvas, 0, 0, 512, 512, 0, 0, 512, 512);
  }
})
export default {
  sum,
  minus
}


// 调试源码用
// cornerstoneWADOImageLoader.external.cornerstone = cornerstone
// cornerstoneWADOImageLoader.external.dicomParser = dicomParser
// cornerstoneWADOImageLoader.webWorkerManager.initialize({
//   maxWebWorkers: navigator.hardwareConcurrency || 1,
//   startWebWorkersOnDemand: true,
//   webWorkerPath: '/cornerstoneWADOImageLoaderWebWorker.js',
//   webWorkerTaskPaths: [],
//   taskConfiguration: {
//     decodeTask: {
//       loadCodecsOnStartup: true,
//       initializeCodecsOnStartup: false,
//       codecsPath: '/cornerstoneWADOImageLoaderCodecs.js'
//     }
//   }
// })

// const element = document.getElementById('dicomImage')
// cornerstone.enable(element)
// const viewportOptions = {
//   voi: {
//     windowWidth: 1200,
//     windowCenter: -600
//   }
// }

// cornerstoneWADOImageLoader.wadouri.loadImage('http://localhost:3000/1.2.840.113619.2.416.20795945767143795462432515614159920').promise.then(function (image) {
//   cornerstone.displayImage(element, image, viewportOptions)
// }, function (err) {
//   console.log(err)
// })
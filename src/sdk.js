
import Viewport from './lib/viewport';
import imageUrls from '../demo/data.json'

let seriesId = '1111111';

const viewport = new Viewport({
  seriesId,
  imageUrls,
  elm: document.querySelector('#wrapper')
})

window.vv = viewport;
document.querySelector('#play').addEventListener('click', function () {
  viewport.autoPlay()
})
document.querySelector('#stop').addEventListener('click', function () {
  viewport.stopPlay()
})
document.body.addEventListener(
  'touchmove',
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);

export default {
  Viewport
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
